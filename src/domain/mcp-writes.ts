import type { CollectionBeforeOperationHook } from 'payload'

/**
 * ADR-2 §3: a write from the MCP server lands as a draft unless the call
 * publishes. The plugin's `updateDocument` and `createDocument` default
 * `draft` to `false`, which would put an edit of a published page live at once.
 *
 * Kept as is: an explicit change of status (`_status` set, which publishes or
 * unpublishes, or `publishAllLocales` / `unpublishAllLocales`), and a move to or
 * from the trash (`deletedAt` alone), which acts on the document itself, not on
 * its content.
 */
export const mcpWriteIsDraft = (args: {
  readonly data?: Record<string, unknown> | null
  readonly draft?: boolean
  readonly publishAllLocales?: boolean
  readonly unpublishAllLocales?: boolean
}): boolean => {
  if (args.draft === true) return true
  const data = args.data ?? {}
  if (
    data._status === 'published' ||
    data._status === 'draft' ||
    args.publishAllLocales === true ||
    args.unpublishAllLocales === true
  )
    return false
  const keys = Object.keys(data)
  if (keys.length > 0 && keys.every((key) => key === 'deletedAt')) return false
  return true
}

export const mcpWritesAsDrafts: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (req.payloadAPI !== 'MCP' || (operation !== 'create' && operation !== 'update')) return args
  return { ...args, draft: mcpWriteIsDraft(args) }
}
