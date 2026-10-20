import type { Block } from 'payload'

import { demoField, headingField, imageField, linkField, tagField } from './fields'

/** Three cards side by side, each a picture, a lead word, a text and a link (Build · Secure · Create). */
export const FeaturesBlock: Block = {
  slug: 'features',
  interfaceName: 'FeaturesBlock',
  fields: [
    headingField,
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'lead', type: 'text', localized: true },
        { name: 'body', type: 'textarea', required: true, localized: true },
        imageField('image'),
        demoField('A still of a film instead of an image.'),
        tagField,
        linkField('link'),
      ],
    },
  ],
}
