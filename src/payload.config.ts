import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { sharpTransformer } from '@payloadcms/transformer-sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { DeletionRequests } from './collections/DeletionRequests'
import { McpAuthorizationCodes } from './collections/McpAuthorizationCodes'
import { McpAuthorizations } from './collections/McpAuthorizations'
import { McpEvents } from './collections/McpEvents'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { defaultLocale, localeLabels, locales } from './domain/locales'
import { mediaStorageConfig } from './domain/media-storage'
import { Site } from './globals/Site'
import { sitePlugins } from './mcp/plugin'

const storage = mediaStorageConfig(process.env)
if (!storage.enabled && process.env.VERCEL_ENV === 'production') {
  // Names only, never values.
  console.warn(`Media storage is off: unusable ${storage.unusable.join(', ')}`)
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      views: {
        // The MCP consent screen (ADR-2). It enforces the session itself.
        mcpConsent: {
          Component: '/admin/mcp-consent/consent-view#McpConsentView',
          path: '/oauth/consent',
        },
      },
    },
  },
  collections: [
    Pages,
    Projects,
    Media,
    Users,
    DeletionRequests,
    McpAuthorizations,
    McpAuthorizationCodes,
    McpEvents,
  ],
  globals: [Site],
  editor: lexicalEditor(),
  // The site reads through the Local API; GraphQL would only widen the public surface.
  graphQL: { disable: true },
  // Payload's shared LLM instructions would be readable wherever their target
  // is (public pages included); nothing here uses them.
  llmInstructions: false,
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
  // Registered even when off: the adapter adds `prefix` and `_objectKey` to `media` either
  // way, so the schema (and its migrations) is the same with or without the S3 variables.
  // Without them, uploads stay on the local disk: fine in development; in production the
  // upload fails until they exist. Private bucket: files are read through Payload, which
  // applies the media access rules. Payload 4 initialises it after `plugins`.
  storage: [
    s3Storage({
      enabled: storage.enabled,
      collections: { media: true },
      bucket: storage.enabled ? storage.bucket : '',
      config: storage.enabled
        ? {
            endpoint: storage.endpoint,
            region: storage.region,
            forcePathStyle: true,
            credentials: {
              accessKeyId: storage.accessKeyId,
              secretAccessKey: storage.secretAccessKey,
            },
          }
        : {},
    }),
  ],
  plugins: sitePlugins(),
})
