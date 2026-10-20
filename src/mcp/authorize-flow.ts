import type { Payload } from 'payload'

import { clientRedirect } from '@/domain/mcp-oauth/authorize-request'
import type { McpOAuthConfig } from '@/domain/mcp-oauth/config'
import { AUTHORIZATION_CODE_TTL_SECONDS } from '@/domain/mcp-oauth/grants'
import { hashSecret, newOpaqueSecret } from '@/domain/mcp-oauth/secrets'
import { verifyConsentTicket } from '@/domain/mcp-oauth/tokens'

import { createAuthorizationCode, recordMcpEvent } from './oauth-store'

/**
 * The decision taken on the consent screen (`POST /oauth/authorize`), outside
 * Next so it runs against a real database in tests. It returns where to send
 * the browser, or which error to show.
 *
 * The ticket is the truth, not the form: the request was validated and frozen
 * when the view rendered, signed and bound to the account that saw it. A
 * ticket of another account, expired or forged, is refused, which also closes
 * cross-site requests.
 */
export type ConsentOutcome =
  | { readonly status: 200; readonly body: { readonly redirectTo: string } }
  | {
      readonly status: 400 | 401
      readonly body: { readonly error: 'invalid' | 'expired' | 'unauthenticated' }
    }

export const decideConsent = async (
  payload: Payload,
  config: McpOAuthConfig,
  input: {
    readonly user: { readonly id: unknown; readonly collection?: unknown } | null
    readonly ticket: unknown
    readonly decision: unknown
  },
  now: Date,
): Promise<ConsentOutcome> => {
  if (!input.user || input.user.collection !== 'users') {
    return { status: 401, body: { error: 'unauthenticated' } }
  }
  const verified = await verifyConsentTicket(input.ticket, config, now)
  if (!verified.ok) return { status: 400, body: { error: verified.reason } }
  const { ticket } = verified
  const userId = String(input.user.id)
  if (ticket.userId !== userId) return { status: 400, body: { error: 'invalid' } }
  if (input.decision !== 'approve' && input.decision !== 'deny') {
    return { status: 400, body: { error: 'invalid' } }
  }
  const clientId = ticket.request.client.clientId

  if (input.decision === 'deny') {
    await recordMcpEvent(payload, { type: 'consent_denied', userId, clientId })
    // RFC 6749 §4.1.2.1: the client shows the refusal instead of waiting.
    return {
      status: 200,
      body: {
        redirectTo: clientRedirect(ticket.request, { error: 'access_denied' }, config.issuer),
      },
    }
  }

  const code = newOpaqueSecret()
  await createAuthorizationCode(payload, {
    codeHash: hashSecret(code),
    userId,
    request: ticket.request,
    expiresAt: new Date(now.getTime() + AUTHORIZATION_CODE_TTL_SECONDS * 1000),
  })
  await recordMcpEvent(payload, { type: 'consent_granted', userId, clientId })
  return {
    status: 200,
    body: { redirectTo: clientRedirect(ticket.request, { code }, config.issuer) },
  }
}
