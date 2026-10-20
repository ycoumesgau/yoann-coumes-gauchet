import type { CollectionConfig } from 'payload'

import { adminOutsideMcp } from '@/domain/access'

/**
 * Administrators of the site. Nobody signs up: accounts are created by an
 * administrator. Never through the MCP server: an email or password change from
 * the model would be an account takeover (second lock behind `isExposedItem`).
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  auth: true,
  access: {
    create: adminOutsideMcp,
    read: adminOutsideMcp,
    update: adminOutsideMcp,
    delete: adminOutsideMcp,
  },
  fields: [{ name: 'name', type: 'text' }],
  versions: false,
}
