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
      admin: { description: 'Profiles and contact links shown in the footer.' },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
