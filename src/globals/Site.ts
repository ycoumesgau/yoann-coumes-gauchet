import type { GlobalConfig } from 'payload'

import { adminOnly, publicRead } from '@/domain/access'

export const Site: GlobalConfig = {
  slug: 'site',
  access: {
    read: publicRead,
    update: adminOnly,
    readVersions: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'navigation',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'page', type: 'relationship', relationTo: 'pages', required: true },
      ],
    },
    {
      name: 'links',
      type: 'array',
      admin: {
        description:
          "Footer links. A profile is a full URL; a page of this site is a path without its language (`/privacy`), which the footer keeps in the reader's language.",
      },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
