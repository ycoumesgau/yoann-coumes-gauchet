import type { Block } from 'payload'

import { headingField } from './fields'

/** Figures or dates, each with its label, and an optional text beside them. */
export const StatsBlock: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  fields: [
    headingField,
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'value', type: 'text', required: true, localized: true },
        { name: 'label', type: 'text', required: true, localized: true },
      ],
    },
    { name: 'body', type: 'richText', localized: true },
  ],
}
