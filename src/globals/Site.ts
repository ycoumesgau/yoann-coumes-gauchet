import type { GlobalConfig } from 'payload'

import { adminOnly, publicRead } from '@/domain/access'
import { demoKeys } from '@/domain/demos'

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
      name: 'labels',
      type: 'group',
      admin: { description: 'The words of the frame itself: menu, theme, screenshot viewer.' },
      fields: [
        { name: 'menu', type: 'text', localized: true },
        { name: 'closeMenu', type: 'text', localized: true },
        { name: 'dark', type: 'text', localized: true },
        { name: 'light', type: 'text', localized: true },
        { name: 'viewLarger', type: 'text', localized: true },
        { name: 'close', type: 'text', localized: true },
        { name: 'previous', type: 'text', localized: true },
        { name: 'next', type: 'text', localized: true },
        { name: 'play', type: 'text', localized: true },
        { name: 'replay', type: 'text', localized: true },
      ],
    },
    {
      name: 'navigation',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'page', type: 'relationship', relationTo: 'pages', required: true },
      ],
    },
    {
      name: 'filmTexts',
      type: 'array',
      admin: {
        description:
          'Words inside the films (labels, chips, captions), by film and key. A film shows nothing for a key it does not find.',
      },
      fields: [
        {
          name: 'film',
          type: 'select',
          required: true,
          options: demoKeys.map((key) => ({ label: key, value: key })),
        },
        { name: 'key', type: 'text', required: true },
        { name: 'text', type: 'text', required: true, localized: true },
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
