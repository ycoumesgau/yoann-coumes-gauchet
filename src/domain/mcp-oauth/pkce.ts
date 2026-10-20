import { createHash } from 'node:crypto'

import { constantTimeEquals } from './secrets'

/** PKCE (RFC 7636), S256 only: `plain` adds nothing against code interception. */

/** An S256 challenge: SHA-256 in unpadded base64url, hence 43 characters. */
export const isS256Challenge = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value)

/** RFC 7636 §4.1: 43 to 128 unreserved characters. */
export const isCodeVerifier = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9\-._~]{43,128}$/.test(value)

export const s256 = (verifier: string): string =>
  createHash('sha256').update(verifier, 'ascii').digest('base64url')

export const verifyPkceS256 = (verifier: unknown, challenge: string): boolean =>
  isCodeVerifier(verifier) && constantTimeEquals(s256(verifier), challenge)
