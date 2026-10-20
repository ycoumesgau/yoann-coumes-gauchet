import type { Block } from 'payload'

import { demoKeys } from '@/domain/demos'

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    { name: 'headline', type: 'text', required: true, localized: true },
    { name: 'subhead', type: 'textarea', localized: true },
    {
      name: 'demo',
      type: 'select',
      options: demoKeys.map((key) => ({ label: key, value: key })),
      admin: { description: 'Optional demonstration shown beside the headline.' },
    },
  ],
}
