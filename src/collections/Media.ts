import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/domain/access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Media are public once uploaded: they only exist to be shown on the site.
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  trash: true,
  fields: [{ name: 'alt', type: 'text', required: true, localized: true }],
  upload: {
    // Images, short videos, the CV, and Rive animations (`.riv` arrives as octet-stream).
    mimeTypes: [
      'image/*',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'application/octet-stream',
    ],
  },
}
