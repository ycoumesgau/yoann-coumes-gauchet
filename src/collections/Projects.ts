import type { CollectionConfig } from 'payload'

import { adminOnly, publishedOrAdmin } from '@/domain/access'
import { validateSlug } from '@/domain/slug'

/** A project shown as a card. Its own story lives on the page it links to. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'period', '_status'] },
  access: {
    read: publishedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
    readVersions: adminOnly,
  },
  trash: true,
  versions: { drafts: true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, validate: validateSlug },
    { name: 'tagline', type: 'text', required: true, localized: true },
    { name: 'period', type: 'text', required: true, localized: true },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'One or two sentences, at the level of the result.' },
    },
    { name: 'page', type: 'relationship', relationTo: 'pages' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
