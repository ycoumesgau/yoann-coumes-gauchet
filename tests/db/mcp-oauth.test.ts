import { Forbidden, getPayload, NotFound, type Payload, type PayloadRequest } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { validateAuthorizeRequest } from '@/domain/mcp-oauth/authorize-request'
import { CLAUDE_CODE_CLIENT } from '@/domain/mcp-oauth/client'
import type { McpOAuthConfig } from '@/domain/mcp-oauth/config'
import { s256 } from '@/domain/mcp-oauth/pkce'
import { signAccessToken, signConsentTicket } from '@/domain/mcp-oauth/tokens'
import { decideConsent } from '@/mcp/authorize-flow'
import { journaled, requestPermanentDeletion } from '@/mcp/plugin'
import { authenticateMcpRequest } from '@/mcp/resource-auth'
import { exchangeToken } from '@/mcp/token-flow'
import config from '@/payload.config'
import type { User } from '@/payload-types'

import { testMcpConfig } from '../support/mcp-config'

let payload: Payload
let mcp: McpOAuthConfig
let user: User & { collection: 'users' }
const redirectUri = 'http://127.0.0.1:43123/callback'
const verifier = 'a'.repeat(50)

const form = (fields: Record<string, string>) => new URLSearchParams(fields)
const bearer = (token: string) => new Headers({ Authorization: `Bearer ${token}` })

/** Consent as Yoann, return the code sent back to Claude Code. */
const consent = async (): Promise<string> => {
  const validated = validateAuthorizeRequest(
    new URLSearchParams({
      client_id: CLAUDE_CODE_CLIENT.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      code_challenge: s256(verifier),
      code_challenge_method: 'S256',
      state: 'st',
    }),
    { resource: mcp.resource },
  )
  if (!validated.ok) throw new Error(validated.reason)
  const ticket = await signConsentTicket(
    { userId: String(user.id), request: validated.request },
    mcp,
    new Date(),
  )
  const outcome = await decideConsent(
    payload,
    mcp,
    { user, ticket, decision: 'approve' },
    new Date(),
  )
  if (outcome.status !== 200) throw new Error(outcome.body.error)
  return new URL(outcome.body.redirectTo).searchParams.get('code')!
}

const exchange = (code: string) =>
  exchangeToken(
    payload,
    mcp,
    form({
      grant_type: 'authorization_code',
      client_id: CLAUDE_CODE_CLIENT.clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
    new Date(),
  )

const refresh = (refreshToken: string) =>
  exchangeToken(
    payload,
    mcp,
    form({
      grant_type: 'refresh_token',
      client_id: CLAUDE_CODE_CLIENT.clientId,
      refresh_token: refreshToken,
    }),
    new Date(),
  )

describe('MCP OAuth server', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    mcp = await testMcpConfig()
    const created = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { email: `mcp-${Date.now()}@example.test`, password: `pw-${Date.now()}-x` },
    })
    user = { ...created, collection: 'users' }
  })

  it('refuses a consent ticket presented by another account', async () => {
    const validated = validateAuthorizeRequest(
      new URLSearchParams({
        client_id: CLAUDE_CODE_CLIENT.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        code_challenge: s256(verifier),
        code_challenge_method: 'S256',
      }),
      { resource: mcp.resource },
    )
    if (!validated.ok) throw new Error(validated.reason)
    const ticket = await signConsentTicket(
      { userId: '999999', request: validated.request },
      mcp,
      new Date(),
    )
    const outcome = await decideConsent(
      payload,
      mcp,
      { user, ticket, decision: 'approve' },
      new Date(),
    )
    expect(outcome.status).toBe(400)
  })

  it('issues tokens for a code once, and revokes what a replayed code opened', async () => {
    const code = await consent()
    const first = await exchange(code)
    expect(first.status).toBe(200)
    if (first.status !== 200) return
    const auth = await authenticateMcpRequest(
      payload,
      mcp,
      bearer(first.body.access_token),
      new Date(),
    )
    expect(auth.ok).toBe(true)

    const replay = await exchange(code)
    expect(replay).toEqual({ status: 400, body: { error: 'invalid_grant' } })
    const after = await authenticateMcpRequest(
      payload,
      mcp,
      bearer(first.body.access_token),
      new Date(),
    )
    expect(after.ok).toBe(false)
  })

  it('rotates refresh tokens and revokes the lineage when an old one returns', async () => {
    const issued = await exchange(await consent())
    if (issued.status !== 200) throw new Error('not issued')
    const rotated = await refresh(issued.body.refresh_token)
    expect(rotated.status).toBe(200)
    if (rotated.status !== 200) return

    expect((await refresh(issued.body.refresh_token)).status).toBe(400)
    // The thief's replay also cut the legitimate holder: the lineage is closed.
    expect((await refresh(rotated.body.refresh_token)).status).toBe(400)
    const auth = await authenticateMcpRequest(
      payload,
      mcp,
      bearer(rotated.body.access_token),
      new Date(),
    )
    expect(auth.ok).toBe(false)
  })

  it('cuts an access token as soon as its connection is deleted in /admin', async () => {
    const issued = await exchange(await consent())
    if (issued.status !== 200) throw new Error('not issued')
    const before = await authenticateMcpRequest(
      payload,
      mcp,
      bearer(issued.body.access_token),
      new Date(),
    )
    if (!before.ok) throw new Error('not authenticated')
    await payload.delete({
      collection: 'mcp-authorizations',
      id: Number(before.caller.authorizationId),
      overrideAccess: false,
      user,
    })
    const after = await authenticateMcpRequest(
      payload,
      mcp,
      bearer(issued.body.access_token),
      new Date(),
    )
    expect(after.ok).toBe(false)
  })

  it('journals without secrets', async () => {
    const { docs } = await payload.find({
      collection: 'mcp-events',
      overrideAccess: false,
      user,
      limit: 100,
    })
    expect(docs.map((doc) => doc.type)).toEqual(
      expect.arrayContaining([
        'consent_granted',
        'token_issued',
        'token_refreshed',
        'lineage_revoked',
      ]),
    )
    expect(JSON.stringify(docs)).not.toMatch(/[A-Za-z0-9_-]{43}/)
  })

  it('keeps the OAuth records closed to the administrator through the API', async () => {
    await expect(
      payload.find({ collection: 'mcp-authorization-codes', overrideAccess: false, user }),
    ).rejects.toThrow(Forbidden)
    const { docs } = await payload.find({
      collection: 'mcp-authorizations',
      overrideAccess: false,
      user,
    })
    expect(docs[0]).toBeDefined()
    expect(docs[0]).not.toHaveProperty('refreshTokenHash')
    expect(docs[0]).not.toHaveProperty('codeHash')
  })
})

describe('permanent deletion', () => {
  const mcpReq = (): Partial<PayloadRequest> => ({ payloadAPI: 'MCP', user: { ...user } as never })

  it('waits for Yoann: the MCP server cannot confirm its own request', async () => {
    const page = await payload.create({
      collection: 'pages',
      overrideAccess: false,
      user,
      data: { title: 'To delete', slug: `delete-${Date.now()}` },
    })
    await payload.update({
      collection: 'pages',
      id: page.id,
      overrideAccess: false,
      user,
      data: { deletedAt: new Date().toISOString() },
    })
    const request = await payload.create({
      collection: 'deletion-requests',
      overrideAccess: false,
      req: mcpReq(),
      data: {
        targetCollection: 'pages',
        targetId: String(page.id),
        targetTitle: 'To delete',
        status: 'confirmed',
      },
    })
    expect(request.status).toBe('pending')

    await expect(
      payload.update({
        collection: 'deletion-requests',
        id: request.id,
        overrideAccess: false,
        req: mcpReq(),
        data: { status: 'confirmed' },
      }),
    ).rejects.toThrow(Forbidden)
    const stillThere = await payload.find({
      collection: 'pages',
      trash: true,
      overrideAccess: false,
      user,
      where: { id: { equals: page.id } },
    })
    expect(stillThere.docs).toHaveLength(1)

    await payload.update({
      collection: 'deletion-requests',
      id: request.id,
      overrideAccess: false,
      user,
      data: { status: 'confirmed' },
    })
    const gone = await payload.find({
      collection: 'pages',
      trash: true,
      overrideAccess: false,
      user,
      where: { id: { equals: page.id } },
    })
    expect(gone.docs).toHaveLength(0)
  })
})

/** A request as the plugin builds it: Yoann's account, through the MCP server. */
const asMcp = async (): Promise<PayloadRequest> =>
  ({ payload, user: { ...user }, payloadAPI: 'MCP', context: {} }) as unknown as PayloadRequest

const trashedPage = async (title: string) => {
  const page = await payload.create({
    collection: 'pages',
    overrideAccess: false,
    user,
    data: { title, slug: `${title.toLowerCase().replace(/\W+/g, '-')}-${Date.now()}` },
  })
  await payload.update({
    collection: 'pages',
    id: page.id,
    overrideAccess: false,
    user,
    data: { deletedAt: new Date().toISOString() },
  })
  return page
}

describe('MCP review fixes', () => {
  it('deletes nothing when the document left the trash after the request', async () => {
    const page = await trashedPage('Restored later')
    const request = await payload.create({
      collection: 'deletion-requests',
      overrideAccess: false,
      user,
      data: {
        targetCollection: 'pages',
        targetId: String(page.id),
        targetTitle: 'Restored later',
        status: 'pending',
      },
    })
    await payload.update({
      collection: 'pages',
      id: page.id,
      trash: true,
      overrideAccess: false,
      user,
      data: { deletedAt: null, _status: 'published' },
    })
    await expect(
      payload.update({
        collection: 'deletion-requests',
        id: request.id,
        overrideAccess: false,
        user,
        data: { status: 'confirmed' },
      }),
    ).rejects.toThrow(/no longer in the trash/)
    const live = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      user: null,
      where: { id: { equals: page.id } },
    })
    expect(live.docs).toHaveLength(1)
  })

  it('records who confirmed, whatever the caller sends', async () => {
    const page = await trashedPage('Confirmed by Yoann')
    const request = await payload.create({
      collection: 'deletion-requests',
      overrideAccess: false,
      user,
      data: {
        targetCollection: 'pages',
        targetId: String(page.id),
        targetTitle: 'Confirmed by Yoann',
        status: 'confirmed',
        decidedBy: 999999,
      },
    })
    expect(request.decidedBy ?? null).toBeNull()
    const confirmed = await payload.update({
      collection: 'deletion-requests',
      id: request.id,
      overrideAccess: false,
      user,
      depth: 0,
      data: { status: 'confirmed' },
    })
    expect(confirmed.decidedBy).toBe(user.id)
  })

  it('refuses a deletion request for a document outside the trash', async () => {
    const page = await payload.create({
      collection: 'pages',
      overrideAccess: false,
      user,
      data: { title: 'Still live', slug: `still-live-${Date.now()}` },
    })
    const response = await requestPermanentDeletion.handler({
      slug: 'pages',
      input: { id: page.id },
      req: await asMcp(),
    } as never)
    expect(response.isError).toBe(true)
    const { totalDocs } = await payload.count({
      collection: 'deletion-requests',
      overrideAccess: false,
      user,
      where: { targetId: { equals: String(page.id) } },
    })
    expect(totalDocs).toBe(0)
  })

  it('keeps an MCP edit of a published page a draft until it publishes', async () => {
    const slug = `mcp-draft-${Date.now()}`
    const page = await payload.create({
      collection: 'pages',
      overrideAccess: false,
      user,
      data: { title: 'Public text', slug, _status: 'published' },
    })
    const publicTitle = async () =>
      (
        await payload.find({
          collection: 'pages',
          overrideAccess: false,
          user: null,
          where: { slug: { equals: slug } },
        })
      ).docs[0]?.title
    await payload.update({
      collection: 'pages',
      id: page.id,
      overrideAccess: false,
      req: await asMcp(),
      data: { title: 'Edited by Claude' },
    })
    expect(await publicTitle()).toBe('Public text')
    await payload.update({
      collection: 'pages',
      id: page.id,
      overrideAccess: false,
      req: await asMcp(),
      data: { title: 'Published by Claude', _status: 'published' },
    })
    expect(await publicTitle()).toBe('Published by Claude')
  })

  it('keeps accounts and connections out of the MCP server, even past the tool list', async () => {
    const req = await asMcp()
    await expect(
      payload.update({
        collection: 'users',
        id: user.id,
        overrideAccess: false,
        req,
        data: { email: `taken-${Date.now()}@example.test` },
      }),
    ).rejects.toThrow(Forbidden)
    await expect(
      payload.find({ collection: 'mcp-authorizations', overrideAccess: false, req }),
    ).rejects.toThrow(Forbidden)
  })

  it('journals a tool call that throws', async () => {
    const tool = journaled({
      type: 'collectionTool',
      mcpName: 'findDocuments',
      collectionSlug: 'pages',
      configKey: 'find',
      tool: {
        handler: () => {
          throw new NotFound()
        },
      },
    } as never) as unknown as {
      tool: { handler: (args: unknown) => Promise<unknown> }
    }
    const req = await asMcp()
    const id = Date.now()
    await expect(tool.tool.handler({ slug: 'pages', input: { id }, req })).rejects.toThrow(NotFound)
    const { docs } = await payload.find({
      collection: 'mcp-events',
      overrideAccess: false,
      user,
      where: { target: { equals: `pages/${id}` } },
    })
    expect(docs[0]).toMatchObject({ type: 'tool_call', tool: 'findDocuments', isError: true })
  })

  it('refuses a token whose account or client does not match its connection', async () => {
    const issued = await exchange(await consent())
    if (issued.status !== 200) throw new Error('not issued')
    const auth = await authenticateMcpRequest(
      payload,
      mcp,
      bearer(issued.body.access_token),
      new Date(),
    )
    if (!auth.ok) throw new Error('not authenticated')
    const forged = (claims: { sub: string; clientId: string }) =>
      signAccessToken({ ...claims, authorizationId: auth.caller.authorizationId }, mcp, new Date())
    // Another existing account: only the comparison with the grant refuses it.
    const other = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { email: `other-${Date.now()}@example.test`, password: `pw-${Date.now()}-y` },
    })
    const otherSub = await forged({ sub: String(other.id), clientId: CLAUDE_CODE_CLIENT.clientId })
    const otherClient = await forged({ sub: String(user.id), clientId: 'site-claude-ai' })
    expect((await authenticateMcpRequest(payload, mcp, bearer(otherSub), new Date())).ok).toBe(
      false,
    )
    expect((await authenticateMcpRequest(payload, mcp, bearer(otherClient), new Date())).ok).toBe(
      false,
    )
  })
})
