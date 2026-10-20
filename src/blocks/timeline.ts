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
      ],
    },
  ],
}
