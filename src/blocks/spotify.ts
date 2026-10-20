import type { Block } from 'payload'

import { validateSpotifyRef } from '@/domain/embeds'

export const SpotifyBlock: Block = {
  slug: 'spotify',
  interfaceName: 'SpotifyBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'linkLabel', type: 'text', localized: true },
    {
      name: 'ref',
      type: 'text',
      required: true,
      validate: validateSpotifyRef,
      admin: { description: 'For example `playlist:<id>`.' },
    },
  ],
}
