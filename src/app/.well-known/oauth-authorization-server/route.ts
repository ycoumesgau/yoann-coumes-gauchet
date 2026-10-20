import { authorizationServerMetadata } from '@/domain/mcp-oauth/metadata'
import { closedResponse, mcpOAuthConfig } from '@/mcp/runtime'

/** RFC 8414 discovery document. */
export async function GET(): Promise<Response> {
  const loaded = await mcpOAuthConfig()
  if (!loaded.ok) return closedResponse()
  return Response.json(authorizationServerMetadata(loaded.config), {
    headers: { 'Cache-Control': 'public, max-age=300' },
  })
}
