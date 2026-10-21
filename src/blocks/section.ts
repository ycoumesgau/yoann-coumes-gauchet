import type { Block } from 'payload'

import { demoField, headingField, imageField, linkField, tagField } from './fields'

/**
 * A heading and its text, with optionally a number (a step of the method), a
 * film or an image beside or under it, and "the details" folded away.
 */
export const SectionBlock: Block = {
  slug: 'section',
  interfaceName: 'SectionBlock',
  fields: [
    {
      name: 'number',
      type: 'text',
      admin: {
        description:
          'A step number ("01"). The blocks that follow, up to the next numbered section, sit in its column.',
      },
    },
    headingField,
    { name: 'body', type: 'richText', required: true, localized: true },
    {
      name: 'lead',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Set the text larger and darker, as a lead paragraph.' },
    },
    imageField('image'),
    tagField,
    { name: 'imageCaption', type: 'text', localized: true },
    {
      name: 'imageSide',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'right', value: 'right' },
        { label: 'left', value: 'left' },
      ],
    },
    demoField('Film shown under the text.'),
    { name: 'demoCaption', type: 'text', localized: true },
    { name: 'detailsLabel', type: 'text', localized: true },
    {
      name: 'details',
      type: 'richText',
      localized: true,
      admin: { description: 'Longer text, folded under "detailsLabel".' },
    },
    linkField('link'),
  ],
}
