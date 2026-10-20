import type { Payload } from 'payload'

import type { AuthorizeRequest } from '@/domain/mcp-oauth/authorize-request'
import type { StoredAuthorization, StoredAuthorizationCode } from '@/domain/mcp-oauth/grants'
import type { User } from '@/payload-types'

/**
 * Persistence of the MCP authorization server (ADR-2): codes, grants and the
 * journal.
 *
 * Why `overrideAccess: true` here and nowhere else: `/oauth/token` is called
 * by Claude's servers with no session. Nobody is authenticated while a code is
 * exchanged or a token rotated; that exchange is what establishes the
 * identity. And these collections are closed to every API caller, the
 * administrator included: this module is their only writer. The file is
 * exempted by name from the lint rule.
 */

export type McpUser = User & { collection: 'users' }

/** The account behind a `sub`, re-read on every call; `null` if it no longer exists. */
export const findUser = async (payload: Payload, userId: string): Promise<McpUser | null> => {
  if (!/^[1-9][0-9]{0,15}$/.test(userId)) return null
  try {
    const user = await payload.findByID({
      collection: 'users',
      id: Number(userId),
      depth: 0,
      overrideAccess: true,
    })
    return { ...user, collection: 'users' }
  } catch {
    return null
  }
}

const relationId = (value: unknown): string =>
  typeof value === 'object' && value !== null
    ? String((value as { id: unknown }).id)
    : String(value)

// ── Codes ───────────────────────────────────────────────────────────────────

export const createAuthorizationCode = async (
  payload: Payload,
  entry: {
    readonly codeHash: string
    readonly userId: string
    readonly request: AuthorizeRequest
    readonly expiresAt: Date
  },
): Promise<void> => {
  await payload.create({
    collection: 'mcp-authorization-codes',
    overrideAccess: true,
    data: {
      codeHash: entry.codeHash,
      user: Number(entry.userId),
      clientId: entry.request.client.clientId,
      redirectUri: entry.request.redirectUri,
      codeChallenge: entry.request.codeChallenge,
      resource: entry.request.resource,
      expiresAt: entry.expiresAt.toISOString(),
    },
  })
}

export const findAuthorizationCode = async (
  payload: Payload,
  codeHash: string,
): Promise<StoredAuthorizationCode | null> => {
  const { docs } = await payload.find({
    collection: 'mcp-authorization-codes',
    where: { codeHash: { equals: codeHash } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = docs[0]
  if (!doc) return null
  return {
    clientId: doc.clientId,
    redirectUri: doc.redirectUri,
    codeChallenge: doc.codeChallenge,
    resource: doc.resource ?? null,
    userId: relationId(doc.user),
    expiresAt: doc.expiresAt,
  }
}

// ── Grants ──────────────────────────────────────────────────────────────────

export type LoadedAuthorization = StoredAuthorization & {
  readonly id: string
  readonly userId: string
}

export const findAuthorization = async (
  payload: Payload,
  id: string,
): Promise<LoadedAuthorization | null> => {
  if (!/^[1-9][0-9]{0,15}$/.test(id)) return null
  const { docs } = await payload.find({
    collection: 'mcp-authorizations',
    where: { id: { equals: Number(id) } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = docs[0]
  if (!doc) return null
  const rotated = Array.isArray(doc.rotatedRefreshHashes) ? doc.rotatedRefreshHashes : []
  return {
    id: String(doc.id),
    userId: relationId(doc.user),
    clientId: doc.clientId,
    refreshTokenHash: doc.refreshTokenHash ?? null,
    rotatedRefreshHashes: rotated.filter((hash): hash is string => typeof hash === 'string'),
    lastUsedAt: doc.lastUsedAt,
    revokedAt: doc.revokedAt ?? null,
  }
}

/**
 * Creates the grant born from a code. The UNIQUE constraint on `codeHash` is
 * the single-use lock: a second exchange of the same code fails in the
 * database, and the caller revokes the grant that code already opened
 * (RFC 6749 §4.1.2).
 */
export const createAuthorizationFromCode = async (
  payload: Payload,
  entry: {
    readonly userId: string
    readonly clientId: string
    readonly codeHash: string
    readonly refreshTokenHash: string
    readonly now: Date
  },
): Promise<
  | { readonly ok: true; readonly id: string }
  | { readonly ok: false; readonly existingId: string | null }
> => {
  try {
    const doc = await payload.create({
      collection: 'mcp-authorizations',
      overrideAccess: true,
      data: {
        user: Number(entry.userId),
        clientId: entry.clientId,
        codeHash: entry.codeHash,
        refreshTokenHash: entry.refreshTokenHash,
        rotatedRefreshHashes: [],
        lastUsedAt: entry.now.toISOString(),
      },
    })
    return { ok: true, id: String(doc.id) }
  } catch (error) {
    const { docs } = await payload.find({
      collection: 'mcp-authorizations',
      where: { codeHash: { equals: entry.codeHash } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const found = docs[0]
    // Another failure than uniqueness is not dressed up as a reuse.
    if (!found) throw error
    return { ok: false, existingId: String(found.id) }
  }
}

export const rotateRefreshToken = async (
  payload: Payload,
  entry: {
    readonly id: string
    readonly refreshTokenHash: string
    readonly rotated: readonly string[]
    readonly now: Date
  },
): Promise<void> => {
  await payload.update({
    collection: 'mcp-authorizations',
    id: Number(entry.id),
    overrideAccess: true,
    data: {
      refreshTokenHash: entry.refreshTokenHash,
      rotatedRefreshHashes: [...entry.rotated],
      lastUsedAt: entry.now.toISOString(),
    },
  })
}

/** Closes the lineage: no current token any more; the row stays as a trace. */
export const revokeAuthorization = async (
  payload: Payload,
  entry: {
    readonly id: string
    readonly reason: 'refresh_reuse' | 'code_reuse'
    readonly now: Date
  },
): Promise<void> => {
  await payload.update({
    collection: 'mcp-authorizations',
    id: Number(entry.id),
    overrideAccess: true,
    data: {
      refreshTokenHash: null,
      revokedAt: entry.now.toISOString(),
      revokedReason: entry.reason,
    },
  })
}

// ── Journal ─────────────────────────────────────────────────────────────────

export type McpEventType =
  | 'consent_granted'
  | 'consent_denied'
  | 'token_issued'
  | 'token_refreshed'
  | 'token_refused'
  | 'lineage_revoked'
  | 'tool_call'

/** One line per event. Never a token, a code or a hash. */
export const recordMcpEvent = async (
  payload: Payload,
  entry: {
    readonly type: McpEventType
    readonly userId?: string | null
    readonly authorizationId?: string | null
    readonly clientId?: string | null
    readonly tool?: string
    readonly target?: string | null
    readonly isError?: boolean
    readonly details?: Record<string, unknown>
  },
): Promise<void> => {
  await payload.create({
    collection: 'mcp-events',
    overrideAccess: true,
    data: {
      type: entry.type,
      user: entry.userId ? Number(entry.userId) : null,
      authorization: entry.authorizationId ?? null,
      clientId: entry.clientId ?? null,
      tool: entry.tool ?? null,
      target: entry.target ?? null,
      isError: entry.isError ?? false,
      details: entry.details ?? null,
    },
  })
}
