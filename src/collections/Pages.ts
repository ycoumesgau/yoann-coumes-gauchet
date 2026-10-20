import type { CollectionConfig } from 'payload'

import { pageBlocks } from '@/blocks'
import { adminOnly, publishedOrAdmin } from '@/domain/access'
import { validateSlug } from '@/domain/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status', 'updatedAt'] },
  access: {
    read: publishedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  trash: true,
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateSlug,
      admin: { position: 'sidebar', description: '`home` is the root page.' },
    },
    { name: 'layout', type: 'blocks', blocks: pageBlocks, localized: true },
    {
      name: 'meta',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
}
