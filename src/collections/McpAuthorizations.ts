import type { CollectionConfig } from 'payload'

import { adminOnly, closed, closedField } from '@/domain/access'

/**
 * One row per connected Claude client (ADR-2). Visible in `/admin`; deleting a
 * row disconnects that client at once, since every MCP call re-reads its grant.
 * Secrets are stored hashed and never shown.
 */
export const McpAuthorizations: CollectionConfig = {
  slug: 'mcp-authorizations',
  labels: { singular: 'Claude connection', plural: 'Claude connections' },
  admin: {
    useAsTitle: 'clientId',
    defaultColumns: ['clientId', 'lastUsedAt', 'revokedAt', 'createdAt'],
    description: 'Claude clients allowed to act on the site. Delete a row to disconnect it.',
  },
  access: { read: adminOnly, create: closed, update: closed, delete: adminOnly },
  versions: false,
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'clientId', type: 'text', required: true },
    // Single use of a code: a second exchange of the same code fails on this constraint.
    {
      name: 'codeHash',
      type: 'text',
      required: true,
      unique: true,
      access: { read: closedField },
      admin: { hidden: true },
    },
    {
      name: 'refreshTokenHash',
      type: 'text',
      access: { read: closedField },
      admin: { hidden: true },
    },
    {
      name: 'rotatedRefreshHashes',
      type: 'json',
      access: { read: closedField },
      admin: { hidden: true },
    },
    { name: 'lastUsedAt', type: 'date', required: true },
    { name: 'revokedAt', type: 'date' },
    {
      name: 'revokedReason',
      type: 'select',
      options: ['refresh_reuse', 'code_reuse'],
    },
  ],
}
