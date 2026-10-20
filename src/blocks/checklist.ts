import type { Block } from 'payload'

/** Checked lines, and a note beside them. */
export const ChecklistBlock: Block = {
  slug: 'checklist',
  interfaceName: 'ChecklistBlock',
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [{ name: 'text', type: 'text', required: true, localized: true }],
    },
    {
      name: 'note',
      type: 'group',
      fields: [
        { name: 'kicker', type: 'text', localized: true },
        { name: 'title', type: 'text', localized: true },
        { name: 'body', type: 'textarea', localized: true },
      ],
    },
  ],
}
