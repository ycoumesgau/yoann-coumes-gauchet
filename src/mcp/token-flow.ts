import type { Payload } from 'payload'

import { findRegisteredClient } from '@/domain/mcp-oauth/client'
import type { McpOAuthConfig } from '@/domain/mcp-oauth/config'
import {
  decideCodeExchange,
  decideRefresh,
  formatRefreshToken,
  nextRotatedHashes,
  parseRefreshToken,
  type GrantRefusal,
} from '@/domain/mcp-oauth/grants'
import { hashSecret, isOpaqueSecretShape, newOpaqueSecret } from '@/domain/mcp-oauth/secrets'
import { ACCESS_TOKEN_TTL_SECONDS, signAccessToken } from '@/domain/mcp-oauth/tokens'

import {
  createAuthorizationFromCode,
  findAuthorization,
  findAuthorizationCode,
  findUser,
  recordMcpEvent,
  revokeAuthorization,
  rotateRefreshToken,
} from './oauth-store'

/**
 * `POST /oauth/token` (RFC 6749 §4.1.3 and §6), outside Next so it runs
 * against a real database in tests.
 *
 * Refusals speak OAuth and nothing more: `invalid_grant` without the reason
 * (the reason goes to the journal; telling the caller would help a forger).
 */
type OAuthError = 'invalid_request' | 'invalid_client' | 'invalid_grant' | 'unsupported_grant_type'

export type TokenOutcome =
  | {
      readonly status: 200
      readonly body: {
        readonly access_token: string
        readonly token_type: 'Bearer'
        readonly expires_in: number
        readonly refresh_token: string
      }
    }
  | { readonly status: 400 | 401; readonly body: { readonly error: OAuthError } }

const fail = (error: OAuthError): TokenOutcome => ({
  status: error === 'invalid_client' ? 401 : 400,
  body: { error },
})

const field = (form: URLSearchParams, name: string): string | null => {
  const values = form.getAll(name)
  return values.length === 1 && values[0] ? values[0] : null
}

const refuse = async (
  payload: Payload,
  reason: GrantRefusal | 'reused' | 'no_user',
  entry: {
    readonly clientId: string
    readonly authorizationId?: string | null
    readonly grant: string
  },
): Promise<TokenOutcome> => {
  await recordMcpEvent(payload, {
    type: 'token_refused',
    authorizationId: entry.authorizationId ?? null,
    clientId: entry.clientId,
    details: { reason, grant: entry.grant },
  })
  return fail('invalid_grant')
}

const issue = async (
  config: McpOAuthConfig,
  entry: {
    readonly userId: string
    readonly clientId: string
    readonly authorizationId: string
    readonly refreshSecret: string
  },
  now: Date,
): Promise<TokenOutcome> => ({
  status: 200,
  body: {
    access_token: await signAccessToken(
      { sub: entry.userId, clientId: entry.clientId, authorizationId: entry.authorizationId },
      config,
      now,
    ),
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    refresh_token: formatRefreshToken(entry.authorizationId, entry.refreshSecret),
  },
})

export const exchangeToken = async (
  payload: Payload,
  config: McpOAuthConfig,
  form: URLSearchParams,
  now: Date,
): Promise<TokenOutcome> => {
  const grantType = field(form, 'grant_type')
  // A public client identifies itself; PKCE, not a secret, proves possession.
  const client = findRegisteredClient(field(form, 'client_id'))
  if (!client) return fail('invalid_client')
  const clientId = client.clientId

  if (grantType === 'authorization_code') {
    const code = field(form, 'code')
    if (!isOpaqueSecretShape(code)) return fail('invalid_request')
    const codeHash = hashSecret(code)
    const decision = decideCodeExchange(
      await findAuthorizationCode(payload, codeHash),
      {
        clientId,
        redirectUri: field(form, 'redirect_uri'),
        codeVerifier: field(form, 'code_verifier'),
        resource: field(form, 'resource'),
      },
      now,
    )
    if (!decision.ok)
      return refuse(payload, decision.reason, { clientId, grant: 'authorization_code' })
    if (!(await findUser(payload, decision.userId))) {
      return refuse(payload, 'no_user', { clientId, grant: 'authorization_code' })
    }

    const refreshSecret = newOpaqueSecret()
    const created = await createAuthorizationFromCode(payload, {
      userId: decision.userId,
      clientId,
      codeHash,
      refreshTokenHash: hashSecret(refreshSecret),
      now,
    })
    if (!created.ok) {
      if (created.existingId) {
        await revokeAuthorization(payload, { id: created.existingId, reason: 'code_reuse', now })
        await recordMcpEvent(payload, {
          type: 'lineage_revoked',
          authorizationId: created.existingId,
          clientId,
          details: { reason: 'code_reuse' },
        })
      }
      return refuse(payload, 'reused', {
        clientId,
        authorizationId: created.existingId,
        grant: 'authorization_code',
      })
    }
    await recordMcpEvent(payload, {
      type: 'token_issued',
      userId: decision.userId,
      authorizationId: created.id,
      clientId,
    })
    return issue(
      config,
      { userId: decision.userId, clientId, authorizationId: created.id, refreshSecret },
      now,
    )
  }

  if (grantType === 'refresh_token') {
    const parsed = parseRefreshToken(field(form, 'refresh_token'))
    if (!parsed) return fail('invalid_request')
    const authorization = await findAuthorization(payload, parsed.authorizationId)
    const decision = decideRefresh(
      authorization,
      { presentedHash: hashSecret(parsed.secret), clientId },
      now,
    )
    if (decision.kind === 'refuse' || !authorization) {
      return refuse(payload, decision.kind === 'refuse' ? decision.reason : 'unknown', {
        clientId,
        authorizationId: authorization?.id ?? null,
        grant: 'refresh_token',
      })
    }
    if (decision.kind === 'revoke_lineage') {
      // A rotated token came back: someone else holds a copy (RFC 9700 §4.14.2).
      await revokeAuthorization(payload, { id: authorization.id, reason: 'refresh_reuse', now })
      await recordMcpEvent(payload, {
        type: 'lineage_revoked',
        authorizationId: authorization.id,
        clientId,
        details: { reason: 'refresh_reuse' },
      })
      return refuse(payload, 'reused', {
        clientId,
        authorizationId: authorization.id,
        grant: 'refresh_token',
      })
    }
    if (!(await findUser(payload, authorization.userId))) {
      return refuse(payload, 'no_user', {
        clientId,
        authorizationId: authorization.id,
        grant: 'refresh_token',
      })
    }

    const refreshSecret = newOpaqueSecret()
    await rotateRefreshToken(payload, {
      id: authorization.id,
      refreshTokenHash: hashSecret(refreshSecret),
      rotated: nextRotatedHashes(authorization),
      now,
    })
    await recordMcpEvent(payload, {
      type: 'token_refreshed',
      userId: authorization.userId,
      authorizationId: authorization.id,
      clientId,
    })
    return issue(
      config,
      { userId: authorization.userId, clientId, authorizationId: authorization.id, refreshSecret },
      now,
    )
  }

  return fail(grantType ? 'unsupported_grant_type' : 'invalid_request')
}
