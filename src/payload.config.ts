import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sharpTransformer } from '@payloadcms/transformer-sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { defaultLocale, locales } from './domain/locales'
import { Site } from './globals/Site'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const localeLabels = { en: 'English', fr: 'Français' } as const

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Pages, Projects, Media, Users],
  globals: [Site],
  editor: lexicalEditor(),
  // The site reads through the Local API; GraphQL would only widen the public surface.
  graphQL: { disable: true },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Schema push is for local development only; CI and production run `payload migrate`.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  localization: {
    locales: locales.map((code) => ({ code, label: localeLabels[code] })),
    defaultLocale,
    fallback: true,
  },
  upload: { transformers: [sharpTransformer()] },
})
