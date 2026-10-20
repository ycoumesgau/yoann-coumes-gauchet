import { protectedResourceMetadata } from '@/domain/mcp-oauth/metadata'
import { closedResponse, mcpOAuthConfig } from '@/mcp/runtime'

/**
 * RFC 9728 discovery document, at `/.well-known/oauth-protected-resource/api/mcp`
 * and at the bare path. Any other suffix names no resource of this site.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resource?: string[] }> },
): Promise<Response> {
  const loaded = await mcpOAuthConfig()
  if (!loaded.ok) return closedResponse()
  const { resource = [] } = await params
  const path = `/${resource.join('/')}`
  if (resource.length > 0 && path !== new URL(loaded.config.resource).pathname) {
    return Response.json({ error: 'not_found' }, { status: 404 })
  }
  return Response.json(protectedResourceMetadata(loaded.config), {
    headers: { 'Cache-Control': 'public, max-age=300' },
  })
}
