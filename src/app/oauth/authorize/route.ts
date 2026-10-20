import config from '@payload-config'
import { getPayload } from 'payload'

import { decideConsent } from '@/mcp/authorize-flow'
import { closedResponse, mcpOAuthConfig, NO_STORE } from '@/mcp/runtime'

/**
 * Authorization endpoint of the MCP server (ADR-2).
 *
 * `GET`: Claude sends the browser here. It goes on, request intact, to the
 * consent screen in `/admin`, which requires the session, validates the
 * request and shows it. Nothing is decided here.
 *
 * `POST`: the Allow or Deny click of that screen, with the `/admin` session.
 */
export async function GET(request: Request): Promise<Response> {
  const loaded = await mcpOAuthConfig()
  if (!loaded.ok) return closedResponse()
  const { search } = new URL(request.url)
  // A relative location: the host is never read from the request.
  return new Response(null, {
    status: 302,
    headers: { Location: `/admin/oauth/consent${search}`, ...NO_STORE },
  })
}

export async function POST(request: Request): Promise<Response> {
  const loaded = await mcpOAuthConfig()
  if (!loaded.ok) return closedResponse()

  // Defence in depth: the ticket already binds the decision to the account that saw it.
  const origin = request.headers.get('Origin')
  if (origin !== null && origin !== loaded.config.issuer) {
    return Response.json({ error: 'forbidden' }, { status: 403, headers: NO_STORE })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  const body = (await request.json().catch(() => null)) as {
    ticket?: unknown
    decision?: unknown
  } | null
  const outcome = await decideConsent(
    payload,
    loaded.config,
    { user: user ?? null, ticket: body?.ticket, decision: body?.decision },
    new Date(),
  )
  return Response.json(outcome.body, { status: outcome.status, headers: NO_STORE })
}
