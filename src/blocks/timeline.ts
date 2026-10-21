import type { Block } from 'payload'

export const TimelineBlock: Block = {
  slug: 'timeline',
  interfaceName: 'TimelineBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'linkLabel',
      type: 'text',
      localized: true,
      admin: { description: 'Shown on an entry that links to its page: "→ its page".' },
    },
    {
      name: 'entries',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'period', type: 'text', required: true, localized: true },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'body', type: 'textarea', localized: true },
        { name: 'page', type: 'relationship', relationTo: 'pages' },
        {
          name: 'tone',
          type: 'select',
          defaultValue: 'past',
          options: [
            { label: 'Past', value: 'past' },
            { label: 'Current', value: 'current' },
            { label: 'Highlighted', value: 'highlight' },
          ],
          admin: { description: 'Highlighted: the orange cell, as WeShareBonds on About.' },
        },
        {
          name: 'span',
          type: 'number',
          defaultValue: 1,
          min: 1,
          max: 12,
          admin: {
            step: 0.1,
            description:
              'Width of the cell on a wide screen, relative to the others (1 = one year).',
          },
        },
      ],
    },
  ],
}
