import type { Block } from 'payload'

import { headingField, imageField, tagField } from './fields'
import { statusTones } from './work-rows'

/** Screenshots that open larger on click, or cards with a name (the agents, the characters). */
export const GalleryBlock: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  fields: [
    headingField,
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'source', type: 'text', localized: true },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'screens',
      options: [
        { label: 'screens', value: 'screens' },
        { label: 'cards', value: 'cards' },
        { label: 'wide', value: 'wide' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        imageField('image'),
        { name: 'title', type: 'text', localized: true },
        { name: 'caption', type: 'text', localized: true },
        tagField,
        { name: 'badge', type: 'text', localized: true },
        {
          name: 'badgeTone',
          type: 'select',
          defaultValue: 'live',
          options: statusTones.map((value) => ({ label: value, value })),
          admin: {
            description:
              'Dot of the badge: past (grey), live (accent), private (hollow). A live card gets an accent top rule.',
          },
        },
      ],
    },
  ],
}
