import type { Block } from 'payload'

import { headingField, imageField, linkField, tagField } from './fields'

export const statusTones = ['past', 'live', 'private'] as const

/** One row per project: status, name, one line of facts, a sentence, a screenshot. */
export const WorkRowsBlock: Block = {
  slug: 'workRows',
  interfaceName: 'WorkRowsBlock',
  fields: [
    headingField,
    {
      name: 'rows',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'status', type: 'text', localized: true },
        {
          name: 'tone',
          type: 'select',
          defaultValue: 'past',
          options: statusTones.map((value) => ({ label: value, value })),
          admin: { description: 'Colour of the status dot: past (grey), live (accent), private.' },
        },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'meta', type: 'text', localized: true },
        { name: 'body', type: 'textarea', localized: true },
        linkField('link'),
        imageField('image'),
        tagField,
        { name: 'imageCaption', type: 'text', localized: true },
      ],
    },
  ],
}
