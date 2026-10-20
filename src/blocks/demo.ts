import type { Block } from 'payload'

import { demoKeys } from '@/domain/demos'

export const DemoBlock: Block = {
  slug: 'demo',
  interfaceName: 'DemoBlock',
  fields: [
    {
      name: 'demo',
      type: 'select',
      required: true,
      options: demoKeys.map((key) => ({ label: key, value: key })),
    },
    { name: 'heading', type: 'text', localized: true },
    { name: 'caption', type: 'textarea', localized: true },
    {
      name: 'source',
      type: 'text',
      localized: true,
      admin: { description: 'Where the figures come from: a benchmark, an ADR, a public page.' },
    },
  ],
}
