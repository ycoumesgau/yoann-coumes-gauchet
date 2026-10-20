import config from '@payload-config'
import { REST_POST } from '@payloadcms/next/routes'
import { getPayload } from 'payload'

import { authenticateMcpRequest, challengeResponse } from '@/mcp/resource-auth'
import { closedResponse, mcpOAuthConfig } from '@/mcp/runtime'

/**
 * `/api/mcp`, ahead of Payload's catch-all REST route. It answers what the
 * plugin cannot: 503 while the server is closed, and the RFC 9728 challenge
 * (`WWW-Authenticate` with the metadata URL) that starts OAuth in Claude. An
 * authenticated request goes on to the plugin, which checks the token again.
 */
const rest = REST_POST(config)

export async function POST(request: Request): Promise<Response> {
  const loaded = await mcpOAuthConfig()
  if (!loaded.ok) return closedResponse()
  const payload = await getPayload({ config })
  const auth = await authenticateMcpRequest(payload, loaded.config, request.headers, new Date())
  if (!auth.ok) return challengeResponse(loaded.config, auth.error)
  return rest(request, { params: Promise.resolve({ slug: ['mcp'] }) })
}

/** Streamable HTTP: no server-to-client stream is offered. */
export function GET(): Response {
  return new Response(null, { status: 405, headers: { Allow: 'POST' } })
}
