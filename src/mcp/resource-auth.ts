import type { Payload } from 'payload'

import type { McpOAuthConfig } from '@/domain/mcp-oauth/config'
import { protectedResourceMetadataUrl } from '@/domain/mcp-oauth/metadata'
import { verifyAccessToken } from '@/domain/mcp-oauth/tokens'

import { findAuthorization, findUser, type McpUser } from './oauth-store'

/**
 * Who calls `/api/mcp`. Only an MCP access token opens it: not the `/admin`
 * session cookie, not a Payload JWT. Only the `Bearer` header is read, verified
 * with the MCP key, issuer and audience; `payload.auth` is never called here.
 *
 * Everything is re-read on every call: the grant named by the token must exist
 * and not be revoked (deleting it in `/admin` cuts access without waiting for
 * expiry), and the account must still exist.
 */
export type McpCaller = {
  readonly user: McpUser
  readonly authorizationId: string
  readonly clientId: string
}

export type McpAuthResult =
  | { readonly ok: true; readonly caller: McpCaller }
  | { readonly ok: false; readonly error: 'missing' | 'invalid_token' }

const bearerOf = (headers: Headers): string | null => {
  const match = /^Bearer ([A-Za-z0-9\-_.]+)$/.exec(headers.get('Authorization') ?? '')
  return match?.[1] ?? null
}

export const authenticateMcpRequest = async (
  payload: Payload,
  config: McpOAuthConfig,
  headers: Headers,
  now: Date,
): Promise<McpAuthResult> => {
  const token = bearerOf(headers)
  if (!token) return { ok: false, error: 'missing' }

  const claims = await verifyAccessToken(token, config, now)
  if (!claims) return { ok: false, error: 'invalid_token' }

  const authorization = await findAuthorization(payload, claims.authorizationId)
  if (
    !authorization ||
    authorization.revokedAt !== null ||
    authorization.userId !== claims.sub ||
    authorization.clientId !== claims.clientId
  ) {
    return { ok: false, error: 'invalid_token' }
  }
  const user = await findUser(payload, claims.sub)
  if (!user) return { ok: false, error: 'invalid_token' }

  return {
    ok: true,
    caller: { user, authorizationId: authorization.id, clientId: claims.clientId },
  }
}

/** RFC 9728 §5.1: the challenge tells the client where to start OAuth. */
export const challengeResponse = (
  config: McpOAuthConfig,
  error: 'missing' | 'invalid_token',
): Response => {
  const parts = [`Bearer resource_metadata="${protectedResourceMetadataUrl(config)}"`]
  if (error === 'invalid_token') parts.push('error="invalid_token"')
  return Response.json(
    { error: error === 'invalid_token' ? 'invalid_token' : 'unauthorized' },
    { status: 401, headers: { 'WWW-Authenticate': parts.join(', '), 'Cache-Control': 'no-store' } },
  )
}
