import type { Block } from 'payload'

export const SectionBlock: Block = {
  slug: 'section',
  interfaceName: 'SectionBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'body', type: 'richText', required: true, localized: true },
  ],
}
