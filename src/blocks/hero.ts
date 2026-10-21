import type { Block } from 'payload'

import { demoField, imageField } from './fields'

/** The top of a page: its h1, a lead, and a photo or a film. */
export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      admin: { description: 'Small line above the headline: "WeShareBonds · 2015 – 2024".' },
    },
    {
      name: 'status',
      type: 'text',
      localized: true,
      admin: { description: 'Status pill beside the eyebrow: "steady state".' },
    },
    { name: 'headline', type: 'text', required: true, localized: true },
    { name: 'subhead', type: 'textarea', localized: true },
    {
      name: 'headlineWidth',
      type: 'select',
      options: [
        { label: '16em', value: '16' },
        { label: '17em', value: '17' },
        { label: '18em', value: '18' },
      ],
      admin: { description: 'Longest line of the headline. Empty: the column width.' },
    },
    {
      name: 'subheadWidth',
      type: 'select',
      options: [
        { label: '34em', value: '34' },
        { label: '36em', value: '36' },
        { label: '38em', value: '38' },
      ],
      admin: { description: 'Longest line of the lead. Empty: 38em.' },
    },
    imageField('image', 'Shown beside the headline, in an accent frame when there is a badge.'),
    imageField('badge', 'Small round image over the photo’s corner (Luma).'),
    demoField('Film shown under the headline.'),
  ],
}
