import { importJWK, type CryptoKey, type JWK } from 'jose'

/**
 * Configuration of the MCP authorization server (ADR-2), read from the
 * environment and nothing else.
 *
 * No URL is ever derived from the request: the issuer and the resource come
 * from `SITE_URL`, never from `Host` or `X-Forwarded-*`. A token whose audience
 * followed a request header would be valid for any host an attacker can name.
 *
 * Closed by default and closed on any absence: the routes answer 503, the app
 * still boots (an absence only closes something).
 */
export type McpOAuthConfig = {
  readonly issuer: string
  /** The protected resource (RFC 8707, RFC 9728): `<issuer>/api/mcp`. */
  readonly resource: string
  readonly signingKey: CryptoKey
  /** The public half of the same key: WebCrypto does not verify with a private key. */
  readonly verifyKey: CryptoKey
  readonly kid: string
}

export type McpOAuthClosedReason =
  | 'disabled'
  | 'no-public-url'
  | 'bad-public-url'
  | 'no-key'
  | 'bad-key'

export type McpOAuthConfigResult =
  | { readonly ok: true; readonly config: McpOAuthConfig }
  | { readonly ok: false; readonly reason: McpOAuthClosedReason }

export const MCP_RESOURCE_PATH = '/api/mcp'

/** The only algorithm for MCP tokens. Enumerated, never read from a header. */
export const MCP_SIGNING_ALGORITHM = 'ES256'

const parsePublicUrl = (raw: string): string | null => {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  // A bare origin: no path, query, fragment or credentials.
  if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) return null
  // https everywhere, except the local loop of development and CI.
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return null
  return url.origin
}

export const loadMcpOAuthConfig = async (
  env: Readonly<Record<string, string | undefined>>,
): Promise<McpOAuthConfigResult> => {
  if (env.ENABLE_MCP !== 'true') return { ok: false, reason: 'disabled' }

  const rawUrl = env.SITE_URL?.trim()
  if (!rawUrl) return { ok: false, reason: 'no-public-url' }
  const issuer = parsePublicUrl(rawUrl)
  if (!issuer) return { ok: false, reason: 'bad-public-url' }

  const rawKey = env.MCP_OAUTH_SIGNING_KEY?.trim()
  if (!rawKey) return { ok: false, reason: 'no-key' }

  let jwk: JWK
  try {
    jwk = JSON.parse(rawKey) as JWK
  } catch {
    return { ok: false, reason: 'bad-key' }
  }
  // A PRIVATE EC P-256 key and nothing else: a public key cannot sign, and
  // another key type would open an algorithm confusion.
  if (
    jwk.kty !== 'EC' ||
    jwk.crv !== 'P-256' ||
    typeof jwk.d !== 'string' ||
    typeof jwk.kid !== 'string' ||
    !jwk.kid
  ) {
    return { ok: false, reason: 'bad-key' }
  }
  try {
    const { d: _private, ...publicJwk } = jwk
    const [signingKey, verifyKey] = await Promise.all([
      importJWK(jwk, MCP_SIGNING_ALGORITHM),
      importJWK(publicJwk, MCP_SIGNING_ALGORITHM),
    ])
    if (signingKey instanceof Uint8Array || verifyKey instanceof Uint8Array) {
      return { ok: false, reason: 'bad-key' }
    }
    return {
      ok: true,
      config: {
        issuer,
        resource: `${issuer}${MCP_RESOURCE_PATH}`,
        signingKey,
        verifyKey,
        kid: jwk.kid,
      },
    }
  } catch {
    return { ok: false, reason: 'bad-key' }
  }
}
