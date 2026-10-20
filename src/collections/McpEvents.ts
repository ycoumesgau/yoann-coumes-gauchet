import type { CollectionConfig } from 'payload'

import { adminOnly, closed } from '@/domain/access'

/**
 * The MCP journal (ADR-2 §5): every consent, token and tool call. Append only:
 * nobody updates or deletes a line. It never holds a token, a code or a hash.
 */
export const McpEvents: CollectionConfig = {
  slug: 'mcp-events',
  labels: { singular: 'MCP event', plural: 'MCP journal' },
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['type', 'tool', 'target', 'createdAt'],
  },
  access: { read: adminOnly, create: closed, update: closed, delete: closed },
  versions: false,
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        'consent_granted',
        'consent_denied',
        'token_issued',
        'token_refreshed',
        'token_refused',
        'lineage_revoked',
        'tool_call',
      ],
    },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'authorization', type: 'text' },
    { name: 'clientId', type: 'text' },
    { name: 'tool', type: 'text' },
    { name: 'target', type: 'text' },
    { name: 'isError', type: 'checkbox' },
    { name: 'details', type: 'json' },
  ],
}
