import { verifyPkceS256 } from './pkce'
import { constantTimeEquals, isOpaqueSecretShape } from './secrets'

/**
 * The two decisions of the token endpoint, pure: exchange a code, rotate a
 * refresh token. They decide on records already read and write nothing.
 *
 * Single use of a code is not decided here: it rests on the unique constraint
 * of `mcp-authorizations.codeHash`, which the store hits when it creates the
 * grant (two concurrent exchanges of one code: the database refuses one).
 */

export const AUTHORIZATION_CODE_TTL_SECONDS = 60
/** 30 days without use close a grant. */
export const REFRESH_IDLE_TTL_SECONDS = 30 * 24 * 60 * 60
/** Hashes of rotated tokens kept to detect a reuse. */
export const MAX_ROTATED_HASHES = 100

// ── Code ────────────────────────────────────────────────────────────────────

export type StoredAuthorizationCode = {
  readonly clientId: string
  readonly redirectUri: string
  readonly codeChallenge: string
  readonly resource: string | null
  readonly userId: string
  readonly expiresAt: string
}

export type CodeExchangeInput = {
  readonly clientId: string | null
  readonly redirectUri: string | null
  readonly codeVerifier: string | null
  readonly resource: string | null
}

export type GrantRefusal =
  | 'unknown'
  | 'expired'
  | 'client_mismatch'
  | 'redirect_mismatch'
  | 'pkce_failed'
  | 'resource_mismatch'
  | 'revoked'

export type CodeExchangeDecision =
  | { readonly ok: true; readonly userId: string; readonly clientId: string }
  | { readonly ok: false; readonly reason: GrantRefusal }

export const decideCodeExchange = (
  code: StoredAuthorizationCode | null,
  input: CodeExchangeInput,
  now: Date,
): CodeExchangeDecision => {
  if (!code) return { ok: false, reason: 'unknown' }
  if (now.getTime() >= Date.parse(code.expiresAt)) return { ok: false, reason: 'expired' }
  if (input.clientId !== code.clientId) return { ok: false, reason: 'client_mismatch' }
  // RFC 6749 §4.1.3: the same redirect as in the request, byte for byte (the loopback port included).
  if (input.redirectUri !== code.redirectUri) return { ok: false, reason: 'redirect_mismatch' }
  if (!verifyPkceS256(input.codeVerifier, code.codeChallenge))
    return { ok: false, reason: 'pkce_failed' }
  if (input.resource !== null && code.resource !== null && input.resource !== code.resource) {
    return { ok: false, reason: 'resource_mismatch' }
  }
  return { ok: true, userId: code.userId, clientId: code.clientId }
}

// ── Refresh token ───────────────────────────────────────────────────────────

/**
 * A refresh token reads `<grant id>.<secret>`: the id finds the lineage, the
 * secret alone proves. The id is not secret (it shows in `/admin`); the
 * secret is only stored hashed.
 */
export const formatRefreshToken = (authorizationId: string, secret: string): string =>
  `${authorizationId}.${secret}`

/** Payload's Postgres ids are positive integers. */
const GRANT_ID = /^[1-9][0-9]{0,15}$/

export const parseRefreshToken = (
  token: unknown,
): { authorizationId: string; secret: string } | null => {
  if (typeof token !== 'string') return null
  const dot = token.indexOf('.')
  if (dot < 0) return null
  const authorizationId = token.slice(0, dot)
  const secret = token.slice(dot + 1)
  if (!GRANT_ID.test(authorizationId) || !isOpaqueSecretShape(secret)) return null
  return { authorizationId, secret }
}

export type StoredAuthorization = {
  readonly clientId: string
  readonly refreshTokenHash: string | null
  readonly rotatedRefreshHashes: readonly string[]
  readonly lastUsedAt: string
  readonly revokedAt: string | null
}

export type RefreshDecision =
  | { readonly kind: 'rotate' }
  /** A token already rotated comes back: the whole lineage is revoked (RFC 9700 §4.14.2). */
  | { readonly kind: 'revoke_lineage' }
  | { readonly kind: 'refuse'; readonly reason: GrantRefusal }

export const decideRefresh = (
  authorization: StoredAuthorization | null,
  input: { readonly presentedHash: string; readonly clientId: string | null },
  now: Date,
): RefreshDecision => {
  if (!authorization) return { kind: 'refuse', reason: 'unknown' }
  if (authorization.revokedAt !== null) return { kind: 'refuse', reason: 'revoked' }
  if (input.clientId !== authorization.clientId)
    return { kind: 'refuse', reason: 'client_mismatch' }

  const current = authorization.refreshTokenHash
  if (current !== null && constantTimeEquals(current, input.presentedHash)) {
    const idleMs = now.getTime() - Date.parse(authorization.lastUsedAt)
    if (!(idleMs < REFRESH_IDLE_TTL_SECONDS * 1000)) return { kind: 'refuse', reason: 'expired' }
    return { kind: 'rotate' }
  }
  if (
    authorization.rotatedRefreshHashes.some((hash) => constantTimeEquals(hash, input.presentedHash))
  ) {
    return { kind: 'revoke_lineage' }
  }
  return { kind: 'refuse', reason: 'unknown' }
}

/** Rotated hashes after a rotation: the current one joins them, bounded. */
export const nextRotatedHashes = (authorization: StoredAuthorization): string[] => {
  const list = [...authorization.rotatedRefreshHashes]
  if (authorization.refreshTokenHash) list.push(authorization.refreshTokenHash)
  return list.slice(-MAX_ROTATED_HASHES)
}
