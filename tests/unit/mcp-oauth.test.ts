import { SignJWT } from 'jose'
import { beforeAll, describe, expect, it } from 'vitest'

import { clientRedirect, validateAuthorizeRequest } from '@/domain/mcp-oauth/authorize-request'
import { CLAUDE_APPS_CLIENT, CLAUDE_CODE_CLIENT } from '@/domain/mcp-oauth/client'
import { loadMcpOAuthConfig, type McpOAuthConfig } from '@/domain/mcp-oauth/config'
import { decideDeletionTransition } from '@/domain/mcp-oauth/deletion'
import {
  decideCodeExchange,
  decideRefresh,
  nextRotatedHashes,
  parseRefreshToken,
  REFRESH_IDLE_TTL_SECONDS,
} from '@/domain/mcp-oauth/grants'
import { s256 } from '@/domain/mcp-oauth/pkce'
import { newOpaqueSecret } from '@/domain/mcp-oauth/secrets'
import {
  signAccessToken,
  signConsentTicket,
  verifyAccessToken,
  verifyConsentTicket,
} from '@/domain/mcp-oauth/tokens'

import { testMcpConfig, testMcpEnv } from '../support/mcp-config'

let config: McpOAuthConfig
const now = new Date('2026-10-20T12:00:00Z')
const verifier = 'v'.repeat(64)
const challenge = s256(verifier)

const params = (overrides: Record<string, string | null> = {}) => {
  const base: Record<string, string | null> = {
    client_id: CLAUDE_APPS_CLIENT.clientId,
    redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: 'xyz',
    ...overrides,
  }
  const search = new URLSearchParams()
  for (const [name, value] of Object.entries(base)) if (value !== null) search.set(name, value)
  return search
}

beforeAll(async () => {
  config = await testMcpConfig()
})

describe('configuration', () => {
  it('stays closed unless enabled, with a public URL and a private EC key', async () => {
    const env = await testMcpEnv()
    expect((await loadMcpOAuthConfig({ ...env, ENABLE_MCP: 'false' })).ok).toBe(false)
    expect((await loadMcpOAuthConfig({ ...env, SITE_URL: 'http://example.com' })).ok).toBe(false)
    expect((await loadMcpOAuthConfig({ ...env, SITE_URL: 'https://example.com/path' })).ok).toBe(
      false,
    )
    const { d: _private, ...publicJwk } = JSON.parse(env.MCP_OAUTH_SIGNING_KEY!) as Record<
      string,
      string
    >
    expect(
      (await loadMcpOAuthConfig({ ...env, MCP_OAUTH_SIGNING_KEY: JSON.stringify(publicJwk) })).ok,
    ).toBe(false)
    expect((await loadMcpOAuthConfig(env)).ok).toBe(true)
  })
})

describe('authorization request', () => {
  it('accepts a request from Claude', () => {
    const result = validateAuthorizeRequest(params(), { resource: config.resource })
    expect(result.ok).toBe(true)
  })

  it('accepts Claude Code on any loopback port, and nothing else', () => {
    const code = (uri: string) =>
      validateAuthorizeRequest(
        params({ client_id: CLAUDE_CODE_CLIENT.clientId, redirect_uri: uri }),
        {
          resource: config.resource,
        },
      ).ok
    expect(code('http://localhost:53682/callback')).toBe(true)
    expect(code('http://127.0.0.1:1234/callback')).toBe(true)
    expect(code('http://localhost.evil.com/callback')).toBe(false)
    expect(code('https://localhost:53682/callback')).toBe(false)
    expect(code('http://localhost:53682/callback/../steal')).toBe(false)
    // A port outside 1-65535 would make the redirect throw after consent.
    expect(code('http://localhost:65535/callback')).toBe(true)
    expect(code('http://localhost:65536/callback')).toBe(false)
    expect(code('http://localhost:0/callback')).toBe(false)
  })

  it.each([
    ['an unknown client', { client_id: 'other' }, 'client'],
    ['another redirect', { redirect_uri: 'https://evil.example/cb' }, 'redirect'],
    ['no redirect', { redirect_uri: null }, 'redirect'],
    ['a plain PKCE method', { code_challenge_method: 'plain' }, 'pkce'],
    ['no PKCE', { code_challenge: null }, 'pkce'],
    ['another response type', { response_type: 'token' }, 'malformed'],
    ['another resource', { resource: 'https://evil.example/api/mcp' }, 'resource'],
  ])('refuses %s', (_label, overrides, reason) => {
    const result = validateAuthorizeRequest(params(overrides), { resource: config.resource })
    expect(result).toEqual({ ok: false, reason })
  })

  it('returns state and issuer to the client', () => {
    const url = new URL(
      clientRedirect(
        { redirectUri: 'https://claude.ai/api/mcp/auth_callback', state: 's' },
        { code: 'c' },
        config.issuer,
      ),
    )
    expect(url.searchParams.get('state')).toBe('s')
    expect(url.searchParams.get('iss')).toBe(config.issuer)
  })
})

describe('tokens', () => {
  const claims = { sub: '1', clientId: CLAUDE_APPS_CLIENT.clientId, authorizationId: '7' }

  it('verifies its own access token', async () => {
    const token = await signAccessToken(claims, config, now)
    expect(await verifyAccessToken(token, config, now)).toEqual(claims)
  })

  it('refuses an expired token, a token of another key, and a consent ticket', async () => {
    const token = await signAccessToken(claims, config, now)
    expect(await verifyAccessToken(token, config, new Date(now.getTime() + 3601_000))).toBeNull()
    expect(await verifyAccessToken(token, await testMcpConfig('other'), now)).toBeNull()
    const validated = validateAuthorizeRequest(params(), { resource: config.resource })
    if (!validated.ok) throw new Error('invalid')
    const ticket = await signConsentTicket({ userId: '1', request: validated.request }, config, now)
    expect(await verifyAccessToken(ticket, config, now)).toBeNull()
  })

  it('refuses a token issued for another resource or by another issuer', async () => {
    const elsewhere = await signAccessToken(
      claims,
      { ...config, resource: 'https://other.example/api/mcp' },
      now,
    )
    expect(await verifyAccessToken(elsewhere, config, now)).toBeNull()
    const foreign = await signAccessToken(
      claims,
      { ...config, issuer: 'https://other.example' },
      now,
    )
    expect(await verifyAccessToken(foreign, config, now)).toBeNull()
  })

  it('refuses a token signed with HS256 under any secret', async () => {
    const forged = await new SignJWT({ client_id: claims.clientId, aid: '7' })
      .setProtectedHeader({ alg: 'HS256', typ: 'at+jwt' })
      .setIssuer(config.issuer)
      .setAudience(config.resource)
      .setSubject('1')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode('secret'))
    expect(await verifyAccessToken(forged, config, new Date())).toBeNull()
  })

  it('round-trips a consent ticket and expires it', async () => {
    const validated = validateAuthorizeRequest(params(), { resource: config.resource })
    if (!validated.ok) throw new Error('invalid')
    const ticket = await signConsentTicket({ userId: '1', request: validated.request }, config, now)
    const ok = await verifyConsentTicket(ticket, config, now)
    expect(ok.ok && ok.ticket.userId).toBe('1')
    expect(await verifyConsentTicket(ticket, config, new Date(now.getTime() + 601_000))).toEqual({
      ok: false,
      reason: 'expired',
    })
  })
})

describe('grants', () => {
  const code = {
    clientId: CLAUDE_APPS_CLIENT.clientId,
    redirectUri: 'https://claude.ai/api/mcp/auth_callback',
    codeChallenge: challenge,
    resource: null,
    userId: '1',
    expiresAt: new Date(now.getTime() + 60_000).toISOString(),
  }
  const input = {
    clientId: code.clientId,
    redirectUri: code.redirectUri,
    codeVerifier: verifier,
    resource: null,
  }

  it('exchanges a valid code', () => {
    expect(decideCodeExchange(code, input, now)).toEqual({
      ok: true,
      userId: '1',
      clientId: code.clientId,
    })
  })

  it.each([
    ['an expired code', { ...code, expiresAt: now.toISOString() }, input, 'expired'],
    [
      'another client',
      code,
      { ...input, clientId: CLAUDE_CODE_CLIENT.clientId },
      'client_mismatch',
    ],
    ['another redirect', code, { ...input, redirectUri: null }, 'redirect_mismatch'],
    ['a wrong verifier', code, { ...input, codeVerifier: 'w'.repeat(64) }, 'pkce_failed'],
  ])('refuses %s', (_label, stored, presented, reason) => {
    expect(decideCodeExchange(stored, presented, now)).toEqual({ ok: false, reason })
  })

  const grant = {
    clientId: code.clientId,
    refreshTokenHash: 'current',
    rotatedRefreshHashes: ['old'],
    lastUsedAt: now.toISOString(),
    revokedAt: null,
  }

  it('rotates the current refresh token, revokes on a rotated one', () => {
    expect(
      decideRefresh(grant, { presentedHash: 'current', clientId: grant.clientId }, now),
    ).toEqual({ kind: 'rotate' })
    expect(decideRefresh(grant, { presentedHash: 'old', clientId: grant.clientId }, now)).toEqual({
      kind: 'revoke_lineage',
    })
    expect(nextRotatedHashes(grant)).toEqual(['old', 'current'])
  })

  it('refuses a revoked or idle grant', () => {
    const later = new Date(now.getTime() + REFRESH_IDLE_TTL_SECONDS * 1000)
    expect(
      decideRefresh(grant, { presentedHash: 'current', clientId: grant.clientId }, later),
    ).toEqual({
      kind: 'refuse',
      reason: 'expired',
    })
    expect(
      decideRefresh(
        { ...grant, revokedAt: now.toISOString() },
        { presentedHash: 'current', clientId: grant.clientId },
        now,
      ),
    ).toEqual({ kind: 'refuse', reason: 'revoked' })
  })

  it('parses only well-formed refresh tokens', () => {
    const secret = newOpaqueSecret()
    expect(parseRefreshToken(`12.${secret}`)).toEqual({ authorizationId: '12', secret })
    expect(parseRefreshToken(`012.${secret}`)).toBeNull()
    expect(parseRefreshToken(`12.short`)).toBeNull()
    expect(parseRefreshToken(`1 OR 1=1.${secret}`)).toBeNull()
  })
})

describe('permanent deletion', () => {
  const pending = { status: 'pending', createdAt: now.toISOString() }

  it('deletes only on pending → confirmed, within a day', () => {
    expect(decideDeletionTransition(pending, 'confirmed', now)).toEqual({
      ok: true,
      deleteTarget: true,
    })
    expect(decideDeletionTransition(pending, 'cancelled', now)).toEqual({
      ok: true,
      deleteTarget: false,
    })
    expect(
      decideDeletionTransition(pending, 'confirmed', new Date(now.getTime() + 24 * 3600_000)),
    ).toEqual({ ok: false, reason: 'expired' })
  })

  it('keeps a decision final', () => {
    expect(decideDeletionTransition({ ...pending, status: 'cancelled' }, 'confirmed', now)).toEqual(
      {
        ok: false,
        reason: 'not-pending',
      },
    )
    expect(decideDeletionTransition({ ...pending, status: 'confirmed' }, 'pending', now)).toEqual({
      ok: false,
      reason: 'not-pending',
    })
  })
})
