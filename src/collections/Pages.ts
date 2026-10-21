import type { CollectionConfig } from 'payload'

import { pageBlocks } from '@/blocks'
import { adminOnly, publishedOrAdmin } from '@/domain/access'
import { mcpWritesAsDrafts } from '@/domain/mcp-writes'
import { validateSlug } from '@/domain/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status', 'updatedAt'] },
  access: {
    read: publishedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
    // Without it, Payload 4 derives version access from `read`: an old
    // published version would stay public after a correction or an unpublish.
    readVersions: adminOnly,
  },
  trash: true,
  versions: { drafts: true },
  hooks: { beforeOperation: [mcpWritesAsDrafts] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateSlug,
      admin: { position: 'sidebar', description: '`home` is the root page.' },
    },
    { name: 'layout', type: 'blocks', blocks: pageBlocks, localized: true },
    // `meta` (title, description, share image) is added by the SEO plugin (`plugins/seo.ts`).
  ],
}
