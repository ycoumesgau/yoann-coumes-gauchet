import type { Block } from 'payload'

export const TimelineBlock: Block = {
  slug: 'timeline',
  interfaceName: 'TimelineBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'entries',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'period', type: 'text', required: true, localized: true },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'body', type: 'textarea', localized: true },
      ],
    },
  ],
}
