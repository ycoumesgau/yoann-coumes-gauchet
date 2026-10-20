import type { Field } from 'payload'

import { demoKeys } from '@/domain/demos'

/** A link to a page of this site (kept in the reader's language) or to a full URL. */
export const linkField = (name: string, description?: string): Field => ({
  name,
  type: 'group',
  ...(description ? { admin: { description } } : {}),
  fields: [
    { name: 'label', type: 'text', localized: true },
    { name: 'page', type: 'relationship', relationTo: 'pages' },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'A full URL (https://…, mailto:…) when the link leaves the site.' },
    },
  ],
})

export const imageField = (name: string, description?: string): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  ...(description ? { admin: { description } } : {}),
})

export const demoField = (description?: string): Field => ({
  name: 'demo',
  type: 'select',
  options: demoKeys.map((key) => ({ label: key, value: key })),
  ...(description ? { admin: { description } } : {}),
})

/** Short mono label on an image: "illustration · invented data", a site name. */
export const tagField: Field = { name: 'tag', type: 'text', localized: true }

export const headingField: Field = { name: 'heading', type: 'text', localized: true }
