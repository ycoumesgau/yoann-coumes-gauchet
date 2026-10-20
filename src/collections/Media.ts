import { APIError, type CollectionConfig } from 'payload'

import { adminOnly, untrashedOrAdmin } from '@/domain/access'
import { isAllowedOctetStream, RIVE_TYPES } from '@/domain/uploads'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: untrashedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
    readVersions: adminOnly,
  },
  trash: true,
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!isAllowedOctetStream(data.mimeType, data.filename)) {
          throw new APIError('Only Rive animations (.riv) may be uploaded as binary files.', 400)
        }
        return data
      },
    ],
  },
  fields: [{ name: 'alt', type: 'text', required: true, localized: true }],
  upload: {
    // Images, short videos, the CV, and Rive animations (`.riv` only, see `domain/uploads.ts`).
    mimeTypes: ['image/*', 'video/mp4', 'video/webm', 'application/pdf', ...RIVE_TYPES],
  },
}
