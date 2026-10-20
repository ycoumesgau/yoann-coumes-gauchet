import type { Block } from 'payload'

export const ProjectCardsBlock: Block = {
  slug: 'projectCards',
  interfaceName: 'ProjectCardsBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      required: true,
    },
  ],
}
