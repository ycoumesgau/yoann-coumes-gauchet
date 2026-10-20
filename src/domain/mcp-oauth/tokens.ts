import { errors, jwtVerify, SignJWT } from 'jose'

import { type AuthorizeRequest } from './authorize-request'
import { findRegisteredClient } from './client'
import { MCP_SIGNING_ALGORITHM, type McpOAuthConfig } from './config'

/**
 * The two JWTs of the MCP server, both signed by the MCP's own key (ADR-2).
 * Each carries a distinct `typ` header and verification requires it: a consent
 * ticket is never an access token, nor the reverse, even under the same key.
 * Payload's own session JWT uses another secret and algorithm: neither is
 * accepted in place of the other.
 */

// ── Access token (RFC 9068) ─────────────────────────────────────────────────

export const ACCESS_TOKEN_TYPE = 'at+jwt'
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60

export type AccessTokenClaims = {
  /** The Payload user id. An identity, never a right: rights are re-read on each call. */
  readonly sub: string
  readonly clientId: string
  /** The grant the token comes from: revoking it also cuts the token in flight. */
  readonly authorizationId: string
}

export const signAccessToken = async (
  claims: AccessTokenClaims,
  config: McpOAuthConfig,
  now: Date,
): Promise<string> => {
  const iat = Math.floor(now.getTime() / 1000)
  return new SignJWT({ client_id: claims.clientId, aid: claims.authorizationId })
    .setProtectedHeader({ alg: MCP_SIGNING_ALGORITHM, typ: ACCESS_TOKEN_TYPE, kid: config.kid })
    .setIssuer(config.issuer)
    .setAudience(config.resource)
    .setSubject(claims.sub)
    .setIssuedAt(iat)
    .setExpirationTime(iat + ACCESS_TOKEN_TTL_SECONDS)
    .sign(config.signingKey)
}

/** `null` on any failure. Never throws: a malformed token is an absence of identity. */
export const verifyAccessToken = async (
  token: string,
  config: McpOAuthConfig,
  now: Date,
): Promise<AccessTokenClaims | null> => {
  try {
    const { payload } = await jwtVerify(token, config.verifyKey, {
      algorithms: [MCP_SIGNING_ALGORITHM],
      typ: ACCESS_TOKEN_TYPE,
      issuer: config.issuer,
      audience: config.resource,
      currentDate: now,
      requiredClaims: ['sub', 'exp', 'iat', 'client_id', 'aid'],
    })
    const { sub, client_id: clientId, aid } = payload
    if (typeof sub !== 'string' || !sub) return null
    if (typeof aid !== 'string' || !aid) return null
    const client = findRegisteredClient(clientId)
    if (!client) return null
    return { sub, clientId: client.clientId, authorizationId: aid }
  } catch {
    return null
  }
}

// ── Consent ticket ──────────────────────────────────────────────────────────

/**
 * Handed by the consent view to its form, required by `POST /oauth/authorize`.
 * It freezes the VALIDATED request (the POST re-reads no free field), binds it
 * to the account that saw it (a stolen ticket is useless under another
 * session, which also closes cross-site requests), and expires.
 */
export const CONSENT_TICKET_TYPE = 'site-mcp-consent+jwt'
export const CONSENT_TICKET_TTL_SECONDS = 10 * 60

export type ConsentTicket = {
  readonly userId: string
  readonly request: AuthorizeRequest
}

export const consentTicketAudience = (config: McpOAuthConfig): string =>
  `${config.issuer}/oauth/authorize`

export const signConsentTicket = async (
  ticket: ConsentTicket,
  config: McpOAuthConfig,
  now: Date,
): Promise<string> => {
  const iat = Math.floor(now.getTime() / 1000)
  const { request } = ticket
  return new SignJWT({
    client_id: request.client.clientId,
    redirect_uri: request.redirectUri,
    code_challenge: request.codeChallenge,
    state: request.state,
    resource: request.resource,
  })
    .setProtectedHeader({ alg: MCP_SIGNING_ALGORITHM, typ: CONSENT_TICKET_TYPE, kid: config.kid })
    .setIssuer(config.issuer)
    .setAudience(consentTicketAudience(config))
    .setSubject(ticket.userId)
    .setIssuedAt(iat)
    .setExpirationTime(iat + CONSENT_TICKET_TTL_SECONDS)
    .sign(config.signingKey)
}

export type ConsentTicketResult =
  | { readonly ok: true; readonly ticket: ConsentTicket }
  | { readonly ok: false; readonly reason: 'expired' | 'invalid' }

export const verifyConsentTicket = async (
  token: unknown,
  config: McpOAuthConfig,
  now: Date,
): Promise<ConsentTicketResult> => {
  if (typeof token !== 'string' || !token) return { ok: false, reason: 'invalid' }
  try {
    const { payload } = await jwtVerify(token, config.verifyKey, {
      algorithms: [MCP_SIGNING_ALGORITHM],
      typ: CONSENT_TICKET_TYPE,
      issuer: config.issuer,
      audience: consentTicketAudience(config),
      currentDate: now,
      requiredClaims: ['sub', 'exp', 'client_id', 'redirect_uri', 'code_challenge'],
    })
    const client = findRegisteredClient(payload.client_id)
    const { sub, redirect_uri: redirectUri, code_challenge: codeChallenge } = payload
    const state = payload.state ?? null
    const resource = payload.resource ?? null
    if (!client || typeof sub !== 'string' || !sub) return { ok: false, reason: 'invalid' }
    if (typeof redirectUri !== 'string' || !client.acceptsRedirect(redirectUri))
      return { ok: false, reason: 'invalid' }
    if (typeof codeChallenge !== 'string') return { ok: false, reason: 'invalid' }
    if (state !== null && typeof state !== 'string') return { ok: false, reason: 'invalid' }
    if (resource !== null && resource !== config.resource) return { ok: false, reason: 'invalid' }
    return {
      ok: true,
      ticket: { userId: sub, request: { client, redirectUri, codeChallenge, state, resource } },
    }
  } catch (error) {
    if (error instanceof errors.JWTExpired) return { ok: false, reason: 'expired' }
    return { ok: false, reason: 'invalid' }
  }
}
