import { MinimalTemplate } from '@payloadcms/ui/rsc'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { validateAuthorizeRequest } from '@/domain/mcp-oauth/authorize-request'
import { signConsentTicket } from '@/domain/mcp-oauth/tokens'
import { mcpOAuthConfig } from '@/mcp/runtime'

import { ConsentForm } from './consent-form'

/**
 * The consent screen of the MCP connector (ADR-2), at `/admin/oauth/consent`.
 *
 * Payload does not require a session for a custom view, so this view does it
 * itself and sends Yoann to the login with the request intact. The request is
 * validated here, before anything is shown: an invalid one never shows
 * "Allow" and redirects nowhere. A valid one is frozen in a signed ticket bound
 * to the account, which the form hands to `POST /oauth/authorize`.
 */
const INVALID_REASON = {
  client: 'This client is not registered on this site.',
  redirect: 'The return address does not match the registered client.',
  pkce: 'The request does not carry a valid PKCE challenge.',
  malformed: 'The request is malformed.',
  resource: 'The request targets another resource than this site’s MCP server.',
} as const

const toSearchParams = (raw: AdminViewServerProps['searchParams']): URLSearchParams => {
  const params = new URLSearchParams()
  for (const [name, value] of Object.entries(raw ?? {})) {
    if (Array.isArray(value)) for (const v of value) params.append(name, String(v))
    else if (value !== undefined) params.append(name, String(value))
  }
  return params
}

const Shell = ({ children }: { readonly children: React.ReactNode }) => (
  <MinimalTemplate width="normal">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 0.75)' }}>
      {children}
    </div>
  </MinimalTemplate>
)

const Refusal = ({ reason }: { readonly reason: string }) => (
  <Shell>
    <h2>Request refused</h2>
    <p style={{ color: 'var(--theme-error-500)' }}>{reason}</p>
    <p>Nothing was granted.</p>
    <p>
      <Link href="/admin">Back to the admin</Link>
    </p>
  </Shell>
)

export async function McpConsentView(props: AdminViewServerProps) {
  const { initPageResult, searchParams } = props
  const loaded = await mcpOAuthConfig()
  if (!loaded.ok) return <Refusal reason="The MCP server is closed on this deployment." />

  const params = toSearchParams(searchParams)
  const user = initPageResult.req.user ?? null
  if (!user) {
    redirect(
      `/admin/login?redirect=${encodeURIComponent(`/admin/oauth/consent?${params.toString()}`)}`,
    )
  }
  if (user.collection !== 'users') return <Refusal reason="This account cannot grant access." />

  const validated = validateAuthorizeRequest(params, { resource: loaded.config.resource })
  if (!validated.ok) return <Refusal reason={INVALID_REASON[validated.reason]} />

  const { client } = validated.request
  const ticket = await signConsentTicket(
    { userId: String(user.id), request: validated.request },
    loaded.config,
    new Date(),
  )
  return (
    <Shell>
      <h2>Connect {client.name} to this site?</h2>
      <p>
        {client.name} will act as you ({user.email}) through the site’s MCP server, and the
        authorization code goes back to <strong>{client.redirectHost}</strong>.
      </p>
      <ul style={{ margin: 0 }}>
        <li>
          It can read, create, edit, publish and unpublish pages, projects, media and the site
          settings. Its edits to pages and projects stay drafts until it publishes them.
        </li>
        <li>It can move documents to the trash and restore them.</li>
        <li>
          It cannot delete a document for good: it asks, and you confirm in the deletion requests.
          Replacing the file of a media item does discard the previous file.
        </li>
        <li>It cannot see or change accounts or connections.</li>
      </ul>
      <p>
        The connection lasts until it goes unused for 30 days. Remove it any time in{' '}
        <Link href="/admin/collections/mcp-authorizations">Claude connections</Link>.
      </p>
      <ConsentForm ticket={ticket} />
    </Shell>
  )
}
