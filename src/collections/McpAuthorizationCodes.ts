import type { CollectionConfig } from 'payload'

import { closed } from '@/domain/access'

/** Authorization codes of the MCP server (ADR-2): one-minute lifetime, stored hashed. */
export const McpAuthorizationCodes: CollectionConfig = {
  slug: 'mcp-authorization-codes',
  admin: { hidden: true },
  access: { read: closed, create: closed, update: closed, delete: closed },
  versions: false,
  fields: [
    { name: 'codeHash', type: 'text', required: true, unique: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'clientId', type: 'text', required: true },
    { name: 'redirectUri', type: 'text', required: true },
    { name: 'codeChallenge', type: 'text', required: true },
    { name: 'resource', type: 'text' },
    { name: 'expiresAt', type: 'date', required: true },
  ],
}
