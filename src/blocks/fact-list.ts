import type { Block } from 'payload'

import { headingField } from './fields'

/** Short paragraphs, each opening on a word in bold; numbered when `numbered`. */
export const FactListBlock: Block = {
  slug: 'factList',
  interfaceName: 'FactListBlock',
  fields: [
    headingField,
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'numbered', type: 'checkbox', defaultValue: false },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '2',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '4', value: '4' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'kicker', type: 'text', localized: true },
        { name: 'lead', type: 'text', localized: true },
        { name: 'body', type: 'textarea', localized: true },
      ],
    },
  ],
}
