/**
 * The OAuth clients of the MCP server (ADR-2), registered in code: no dynamic
 * registration, so an unknown client does not exist and nothing is added
 * without a reviewed commit. Both are public (no secret): PKCE S256 proves
 * possession of the code. Yoann enters the client id when adding the connector.
 *
 * The name shown on the consent screen comes from here, never from the request.
 */
export type RegisteredClient = {
  readonly clientId: string
  readonly name: string
  /** Shown on the consent screen: the host the code will be sent to. */
  readonly redirectHost: string
  readonly acceptsRedirect: (uri: string) => boolean
}

/** Claude on the web, desktop, mobile and Cowork: one fixed callback, compared byte for byte. */
export const CLAUDE_APPS_CLIENT: RegisteredClient = {
  clientId: 'site-claude-ai',
  name: 'Claude',
  redirectHost: 'claude.ai',
  acceptsRedirect: (uri) => uri === 'https://claude.ai/api/mcp/auth_callback',
}

/**
 * Claude Code: an RFC 8252 loopback redirect on an ephemeral port. The port is
 * ignored; scheme, host and path are not.
 */
const LOOPBACK = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d{1,5})?\/callback$/
export const CLAUDE_CODE_CLIENT: RegisteredClient = {
  clientId: 'site-claude-code',
  name: 'Claude Code (this computer)',
  redirectHost: 'localhost',
  acceptsRedirect: (uri) => LOOPBACK.test(uri),
}

export const REGISTERED_CLIENTS: readonly RegisteredClient[] = [
  CLAUDE_APPS_CLIENT,
  CLAUDE_CODE_CLIENT,
]

export const findRegisteredClient = (clientId: unknown): RegisteredClient | null =>
  typeof clientId === 'string'
    ? (REGISTERED_CLIENTS.find((client) => client.clientId === clientId) ?? null)
    : null
