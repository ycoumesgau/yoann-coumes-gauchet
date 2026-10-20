import { loadMcpOAuthConfig, type McpOAuthConfigResult } from '@/domain/mcp-oauth/config'

/**
 * The MCP configuration of this process, read once. Closed on any absence
 * (`domain/mcp-oauth/config.ts`): the routes answer 503 without saying which
 * variable is missing.
 */
let cached: Promise<McpOAuthConfigResult> | null = null

export const mcpOAuthConfig = (): Promise<McpOAuthConfigResult> => {
  cached ??= loadMcpOAuthConfig(process.env)
  return cached
}

/** Tests load another environment. */
export const resetMcpOAuthConfig = (): void => {
  cached = null
}

export const NO_STORE = { 'Cache-Control': 'no-store', Pragma: 'no-cache' } as const

export const closedResponse = (): Response =>
  Response.json({ error: 'mcp_closed' }, { status: 503, headers: NO_STORE })
