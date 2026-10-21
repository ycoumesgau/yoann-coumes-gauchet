import { defineCollectionTool, mcpPlugin } from '@payloadcms/plugin-mcp'
import { filterMCPItems } from '@payloadcms/plugin-mcp/internal'
import {
  APIError,
  UnauthorizedError,
  type CollectionSlug,
  type PayloadRequest,
  type Plugin,
} from 'payload'

import { pageBlocks } from '@/blocks'
import { patchBlock } from '@/domain/mcp-blocks'
import { isDeletableCollection, type DeletableCollection } from '@/domain/mcp-oauth/deletion'

import { recordMcpEvent } from './oauth-store'
import { authenticateMcpRequest } from './resource-auth'
import { mcpOAuthConfig } from './runtime'

/**
 * The MCP server of the site (ADR-2), on `@payloadcms/plugin-mcp`.
 *
 * - Exposed: the content (`pages`, `projects`, `media`, the `site` global) with
 *   every built-in tool but `delete`, and the deletion requests (read only).
 *   Everything else (accounts, OAuth records, the journal, Payload's own
 *   collections) is filtered out per request, by a closed list.
 * - Authenticated by the site's OAuth server only (`resource-auth.ts`); the
 *   caller acts as Yoann's account, with Payload access enforced.
 * - Deletion: `update` with `deletedAt` moves a document to the trash (and
 *   back); `requestPermanentDeletion` asks Yoann, who confirms in `/admin`.
 * - `updateBlock` changes one block of a page; `updateDocument` with `layout`
 *   replaces the whole list. `restoreVersion` and `updateGlobal` ignore `select`
 *   (`withoutSelect`).
 * - Every call that reaches a tool is journaled in `mcp-events`, refused or
 *   thrown included (`journaled`). A call the plugin refuses before any tool
 *   (a slug outside the closed list) is answered with an error and not journaled.
 */

type MCPItem = Parameters<typeof filterMCPItems>[0]['items'][number]

const CONTENT: readonly DeletableCollection[] = ['pages', 'projects', 'media']
const READ_ONLY_TOOLS = new Set(['find', 'count'])

/** The closed list: which plugin items a caller may ever see. */
export const isExposedItem = (item: MCPItem): boolean => {
  switch (item.type) {
    case 'collectionTool':
      if ((CONTENT as readonly string[]).includes(item.collectionSlug))
        return item.configKey !== 'delete'
      if (item.collectionSlug === 'deletion-requests') return READ_ONLY_TOOLS.has(item.configKey)
      return false
    case 'globalTool':
      return item.globalSlug === 'site'
    case 'tool':
      return item.configKey === 'getConfigInfo'
    default:
      return false
  }
}

export const requestPermanentDeletion = defineCollectionTool({
  annotations: {
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
    readOnlyHint: false,
    title: 'Request permanent deletion',
  },
  description:
    'Ask Yoann to delete a document for good. The document must already be in the trash (update it with `deletedAt`). Returns a link Yoann opens in /admin to confirm; nothing is deleted until he does.',
  input: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'The document id.' },
      reason: { type: 'string', maxLength: 500, description: 'Why it should go, in one sentence.' },
    },
    required: ['id'],
    additionalProperties: false,
  },
}).handler(async ({ slug, input, req }) => {
  if (!isDeletableCollection(slug)) throw new APIError('Not a content collection.', 400)
  const id = input.id
  if (typeof id !== 'number' || !Number.isInteger(id) || id < 1) {
    throw new APIError('`id` must be a document id.', 400)
  }
  const doc = (await req.payload.findByID({
    collection: slug,
    id,
    trash: true,
    depth: 0,
    overrideAccess: false,
    req,
  })) as { deletedAt?: string | null; title?: string; name?: string; filename?: string | null }
  if (!doc.deletedAt) {
    return {
      content: [
        {
          type: 'text',
          text: 'The document is not in the trash. Move it there first (update with `deletedAt`), then ask again.',
        },
      ],
      isError: true,
    }
  }
  const request = await req.payload.create({
    collection: 'deletion-requests',
    overrideAccess: false,
    req,
    data: {
      targetCollection: slug,
      targetId: String(id),
      targetTitle: doc.title ?? doc.name ?? doc.filename ?? `${slug} ${id}`,
      reason: typeof input.reason === 'string' ? input.reason.slice(0, 500) : null,
      status: 'pending',
    },
  })
  const loaded = await mcpOAuthConfig()
  const base = loaded.ok ? loaded.config.issuer : ''
  return {
    content: [
      {
        type: 'text',
        text: `Deletion requested. Nothing is deleted yet. Yoann confirms here within 24 hours: ${base}/admin/collections/deletion-requests/${request.id}`,
      },
    ],
  }
})

/** The top-level fields of each page block, by `blockType`. */
const blockFields = new Map<string, ReadonlySet<string>>(
  pageBlocks.map((block) => [
    block.slug,
    new Set(block.fields.flatMap((field) => ('name' in field ? [field.name] : []))),
  ]),
)

export const updateBlock = defineCollectionTool({
  annotations: {
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
    readOnlyHint: false,
    title: 'Update one block of a page',
  },
  description:
    "Change some fields of one block in a page's layout, in one locale, and keep every other block as it is. Prefer it to `updateDocument`, whose `layout` replaces the whole list (a block left out is deleted). A group (`labels`, `link`) is merged field by field; a list or a rich text is replaced as sent (an empty list empties it). A field the block does not have is refused. Lands as a draft unless `publish` is true; publishing makes the whole draft of that locale live, not only this block.",
  input: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'The page id.' },
      locale: { type: 'string', enum: ['en', 'fr'] },
      blockId: {
        type: 'string',
        description: 'The block id, from `findDocuments` in that locale.',
      },
      fields: { type: 'object', description: 'The fields to change, as in the block schema.' },
      publish: { type: 'boolean', description: 'Publish this locale with the change.' },
    },
    required: ['id', 'locale', 'blockId', 'fields'],
    additionalProperties: false,
  },
}).handler(async ({ slug, input, req }) => {
  if (slug !== 'pages') throw new APIError('Only pages have blocks.', 400)
  const { id, locale, blockId, fields, publish } = input as {
    id: number
    locale: 'en' | 'fr'
    blockId: string
    fields: Record<string, unknown>
    publish?: boolean
  }
  const page = await req.payload.findByID({
    collection: 'pages',
    id,
    locale,
    fallbackLocale: false,
    draft: true,
    depth: 0,
    overrideAccess: false,
    req,
  })
  const patched = patchBlock(
    page.layout as Parameters<typeof patchBlock>[0],
    blockId,
    fields,
    (type) => blockFields.get(type),
  )
  if (!patched.ok) return { content: [{ type: 'text', text: patched.error }], isError: true }
  await req.payload.update({
    collection: 'pages',
    id,
    locale,
    draft: !publish,
    depth: 0,
    overrideAccess: false,
    req,
    data: {
      layout: patched.layout as never,
      ...(publish ? { _status: 'published' as const } : {}),
    },
  })
  return {
    content: [
      {
        type: 'text',
        text: `Block ${blockId} of page ${id} updated in ${locale}${publish ? ' and published' : ' as a draft'}; the other ${patched.layout.length - 1} blocks are unchanged.`,
      },
    ],
  }
})

const contentTools = { delete: false as const, requestPermanentDeletion }
const pageTools = { ...contentTools, updateBlock }

/** The tools of each content collection: `updateBlock` on pages only. */
export const collectionTools = Object.fromEntries(
  CONTENT.map((slug) => [slug, { tools: slug === 'pages' ? pageTools : contentTools }]),
) as Record<CollectionSlug, { tools: typeof pageTools }>

/** Input is journaled, cut short: a media upload carries its file in base64. */
const summarize = (input: unknown): Record<string, unknown> => {
  const text = JSON.stringify(input ?? null)
  return { input: text.length > 2000 ? `${text.slice(0, 2000)}…` : text }
}

/** `pages/12`, `site`: what the call was about, when the input says. */
const targetOf = (slug: unknown, input: unknown): string | null => {
  if (typeof slug !== 'string') return null
  const id = (input as { id?: unknown } | null)?.id
  return typeof id === 'number' || typeof id === 'string' ? `${slug}/${String(id)}` : slug
}

type ToolHandler = (args: {
  input: Record<string, unknown>
  req: PayloadRequest
  slug?: string
}) => Promise<{ isError?: boolean }>

/**
 * Wraps a tool so its call is journaled whatever happens: the plugin's
 * `afterToolCall` hook is skipped when a handler throws (an access refusal,
 * a document not found), which are the calls worth reading afterwards.
 */
export const journaled = <T extends MCPItem>(item: T): T => {
  if (item.type !== 'collectionTool' && item.type !== 'globalTool') return item
  const handler = item.tool.handler as unknown as ToolHandler
  const wrapped: ToolHandler = async (args) => {
    const caller = args.req.context.mcpCaller as
      | { authorizationId: string; clientId: string }
      | undefined
    const record = (isError: boolean, details: Record<string, unknown>) =>
      recordMcpEvent(args.req.payload, {
        type: 'tool_call',
        userId: args.req.user ? String(args.req.user.id) : null,
        authorizationId: caller?.authorizationId ?? null,
        clientId: caller?.clientId ?? null,
        tool: item.mcpName,
        target: targetOf(args.slug, args.input),
        isError,
        details,
      })
    try {
      const response = await handler(args)
      await record(response.isError === true, summarize(args.input))
      return response
    } catch (error) {
      const name = error instanceof Error ? error.name : 'Error'
      await record(true, { ...summarize(args.input), error: name })
      throw error
    }
  }
  return { ...item, tool: { ...item.tool, handler: wrapped } } as T
}

/**
 * Payload 4.0.0-beta.3 writes the version a `restoreVersion` creates through its
 * `select`: with `select`, the new latest version holds only the selected fields
 * (no title, no slug, no layout), and every later update of the document fails
 * on it. Measured on page 5, 2026-10-21. `updateGlobal` on `site` with `select`
 * fails on the same version row (a null `version_name`) and writes nothing.
 * Measured 2026-10-21. These tools drop `select`.
 */
const SELECT_DROPPED = new Set(['restoreVersion', 'restoreGlobalVersion', 'updateGlobal'])

export const withoutSelect = <T extends MCPItem>(item: T): T => {
  if (item.type !== 'collectionTool' && item.type !== 'globalTool') return item
  if (!SELECT_DROPPED.has(item.configKey)) return item
  const handler = item.tool.handler as unknown as ToolHandler
  const wrapped: ToolHandler = (args) => {
    const { select: _select, ...input } = args.input
    return handler({ ...args, input })
  }
  return { ...item, tool: { ...item.tool, handler: wrapped } } as T
}

/** What every item the caller may see goes through before it is served. */
export const servedItems = (items: readonly MCPItem[]): MCPItem[] =>
  items.map((item) => journaled(withoutSelect(item)))

export const sitePlugins = (): Plugin[] => [
  mcpPlugin({
    disabled: process.env.ENABLE_MCP !== 'true',
    collections: collectionTools,
    mcp: {
      serverOptions: { serverInfo: { name: 'yoann-coumes-gauchet.fr', version: '1' } },
    },
    overrideGetAuthorizedMCP: async ({ pluginConfig, req }) => {
      const loaded = await mcpOAuthConfig()
      if (!loaded.ok || !req.headers) throw new UnauthorizedError(req.t)
      const auth = await authenticateMcpRequest(req.payload, loaded.config, req.headers, new Date())
      if (!auth.ok) throw new UnauthorizedError(req.t)
      req.user = { ...auth.caller.user, _strategy: 'mcp-oauth' }
      req.context.mcpCaller = {
        authorizationId: auth.caller.authorizationId,
        clientId: auth.caller.clientId,
      }
      // `overrideAccess` from the query string is ignored: access is always enforced.
      const items = await filterMCPItems({
        items: pluginConfig.items.filter(isExposedItem),
        overrideAccess: false,
        req,
      })
      return { items: servedItems(items), overrideAccess: false }
    },
  }),
]
