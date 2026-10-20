import type { Block } from 'payload'

import { linkField } from './fields'

/** A heading and a sentence with one link; `accent` fills it with the site's colour. */
export const CalloutBlock: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  fields: [
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'plain',
      options: [
        { label: 'plain', value: 'plain' },
        { label: 'accent', value: 'accent' },
        { label: 'note', value: 'note' },
      ],
    },
    { name: 'heading', type: 'text', localized: true },
    { name: 'body', type: 'textarea', required: true, localized: true },
    linkField('link'),
  ],
}
