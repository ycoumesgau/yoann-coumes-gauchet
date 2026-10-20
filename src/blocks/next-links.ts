import type { Block } from 'payload'

import { linkField } from './fields'

/** The end of a page: where to go next. */
export const NextLinksBlock: Block = {
  slug: 'nextLinks',
  interfaceName: 'NextLinksBlock',
  fields: [
    {
      name: 'links',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [{ name: 'kicker', type: 'text', localized: true }, linkField('link')],
    },
    { name: 'note', type: 'textarea', localized: true },
  ],
}
