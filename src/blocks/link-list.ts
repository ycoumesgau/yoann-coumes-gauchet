import type { Block } from 'payload'

import { headingField } from './fields'

/**
 * Rows that each lead somewhere: education, writing, contact. A row with only
 * `title` and `url` is a contact line.
 */
export const LinkListBlock: Block = {
  slug: 'linkList',
  interfaceName: 'LinkListBlock',
  fields: [
    headingField,
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'period', type: 'text', localized: true },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'body', type: 'text', localized: true },
        { name: 'url', type: 'text' },
        { name: 'urlLabel', type: 'text', localized: true },
      ],
    },
    {
      name: 'files',
      type: 'group',
      admin: { description: 'A line of documents to download (the CV).' },
      fields: [
        { name: 'label', type: 'text', localized: true },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true },
            { name: 'file', type: 'upload', relationTo: 'media' },
            { name: 'lang', type: 'text' },
          ],
        },
      ],
    },
  ],
}
