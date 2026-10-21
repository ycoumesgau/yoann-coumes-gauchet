import type { Block } from 'payload'

/** Two texts side by side, each with its heading. */
export const ColumnsBlock: Block = {
  slug: 'columns',
  interfaceName: 'ColumnsBlock',
  fields: [
    {
      name: 'headingSize',
      type: 'select',
      defaultValue: 'large',
      options: [
        { label: 'Large, as a section heading', value: 'large' },
        { label: 'Small, as a sub-heading', value: 'small' },
      ],
    },
    {
      name: 'columns',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 3,
      fields: [
        { name: 'status', type: 'text', localized: true },
        { name: 'heading', type: 'text', localized: true },
        { name: 'body', type: 'richText', required: true, localized: true },
      ],
    },
  ],
}
