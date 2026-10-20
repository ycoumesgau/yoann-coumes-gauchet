import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Opaque secrets of the authorization server: authorization codes and refresh
 * tokens. 256 random bits, base64url. Only the hash is stored: reading the
 * database yields no usable secret. Plain SHA-256 is enough at 256 bits of entropy.
 */
export const newOpaqueSecret = (): string => randomBytes(32).toString('base64url')

export const hashSecret = (secret: string): string =>
  createHash('sha256').update(secret, 'utf8').digest('hex')

export const constantTimeEquals = (a: string, b: string): boolean => {
  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')
  return left.length === right.length && timingSafeEqual(left, right)
}

/** Shape of a secret issued here: 43 base64url characters (32 bytes). */
export const isOpaqueSecretShape = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value)
