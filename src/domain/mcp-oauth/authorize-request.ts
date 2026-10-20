import { findRegisteredClient, type RegisteredClient } from './client'
import { isS256Challenge } from './pkce'

/**
 * Validation of an authorization request (RFC 6749 §4.1.1, RFC 7636, RFC 8707),
 * before anything is shown.
 *
 * An invalid request NEVER redirects (RFC 9700 §4.11): not to the URL it
 * supplies, not with an error code. It is shown as invalid and stops there.
 * Only a valid request that Yoann refuses goes back to the client with
 * `access_denied`.
 *
 * The order of checks fixes the reason: the client first (without a known
 * client, no redirect makes sense), then the redirect, then the rest.
 */
export type AuthorizeRequest = {
  readonly client: RegisteredClient
  readonly redirectUri: string
  readonly codeChallenge: string
  /** Returned as is to the client; may be absent (the client will refuse that, not us). */
  readonly state: string | null
  /** RFC 8707: the target resource, when the client names it. */
  readonly resource: string | null
}

export type InvalidAuthorizeReason = 'client' | 'redirect' | 'pkce' | 'malformed' | 'resource'

export type AuthorizeRequestResult =
  | { readonly ok: true; readonly request: AuthorizeRequest }
  | { readonly ok: false; readonly reason: InvalidAuthorizeReason }

/** A query parameter: present exactly once and non-empty, otherwise absent. */
const single = (params: URLSearchParams, name: string): string | null => {
  const values = params.getAll(name)
  if (values.length !== 1) return null
  const [value] = values
  return value ? value : null
}

/** Nothing unbounded is copied into a signed ticket. */
const MAX_STATE_LENGTH = 512

export const validateAuthorizeRequest = (
  params: URLSearchParams,
  expected: { readonly resource: string },
): AuthorizeRequestResult => {
  const client = findRegisteredClient(single(params, 'client_id'))
  if (!client) return { ok: false, reason: 'client' }

  // Required: the loopback client has no single registered redirect to fall back on.
  const redirectUri = single(params, 'redirect_uri')
  if (redirectUri === null || !client.acceptsRedirect(redirectUri)) {
    return { ok: false, reason: 'redirect' }
  }

  if (single(params, 'response_type') !== 'code') return { ok: false, reason: 'malformed' }

  const method = single(params, 'code_challenge_method')
  const codeChallenge = single(params, 'code_challenge')
  if (method !== 'S256' || !isS256Challenge(codeChallenge)) return { ok: false, reason: 'pkce' }

  const resourceValues = params.getAll('resource')
  if (resourceValues.length > 1) return { ok: false, reason: 'resource' }
  const resource = resourceValues[0] ?? null
  if (resource !== null && resource !== expected.resource) return { ok: false, reason: 'resource' }

  const stateValues = params.getAll('state')
  if (stateValues.length > 1) return { ok: false, reason: 'malformed' }
  const state = stateValues[0] ? stateValues[0] : null
  if (state !== null && state.length > MAX_STATE_LENGTH) return { ok: false, reason: 'malformed' }

  return { ok: true, request: { client, redirectUri, codeChallenge, state, resource } }
}

/** The way back to the client, for a VALID request only. */
export const clientRedirect = (
  request: Pick<AuthorizeRequest, 'redirectUri' | 'state'>,
  params: Readonly<Record<string, string>>,
  issuer: string,
): string => {
  const url = new URL(request.redirectUri)
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value)
  if (request.state !== null) url.searchParams.set('state', request.state)
  // RFC 9207: the client checks it is talking to the right authorization server.
  url.searchParams.set('iss', issuer)
  return url.toString()
}
