import config from '@payload-config'
import { getPayload } from 'payload'

import { closedResponse, mcpOAuthConfig, NO_STORE } from '@/mcp/runtime'
import { exchangeToken } from '@/mcp/token-flow'

/** Token endpoint of the MCP server (ADR-2): called by Claude's servers, without a session. */
const MAX_BODY_BYTES = 8 * 1024

export async function POST(request: Request): Promise<Response> {
  const loaded = await mcpOAuthConfig()
  if (!loaded.ok) return closedResponse()

  const contentType = request.headers.get('Content-Type') ?? ''
  if (!contentType.toLowerCase().startsWith('application/x-www-form-urlencoded')) {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers: NO_STORE })
  }
  // Refused before reading when the size is announced; checked again after.
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY_BYTES) {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers: NO_STORE })
  }
  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers: NO_STORE })
  }

  const payload = await getPayload({ config })
  const outcome = await exchangeToken(payload, loaded.config, new URLSearchParams(raw), new Date())
  return Response.json(outcome.body, { status: outcome.status, headers: NO_STORE })
}
