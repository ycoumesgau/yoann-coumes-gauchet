import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/domain/access'

/** Administrators of the site. Nobody signs up: accounts are created by an administrator. */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  auth: true,
  access: {
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [{ name: 'name', type: 'text' }],
  versions: false,
}
