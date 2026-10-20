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
  // Adapters run before `plugins` in Payload 4. Without the five variables, uploads stay
  // on the local disk: fine in development, and production shows no upload until they exist.
  // Private bucket: files are read through Payload, which applies the media access rules.
  storage: storage.enabled
    ? [
        s3Storage({
          collections: { media: true },
          bucket: storage.bucket,
          config: {
            endpoint: storage.endpoint,
            region: storage.region,
            forcePathStyle: true,
            credentials: {
              accessKeyId: storage.accessKeyId,
              secretAccessKey: storage.secretAccessKey,
            },
          },
        }),
      ]
    : [],
  plugins: sitePlugins(),
})
