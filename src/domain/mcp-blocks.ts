/**
 * One block of a page, changed without sending the whole layout back.
 *
 * Through `updateDocument`, `layout` replaces the whole list for the locale: a
 * block left out is deleted (measured in production, 2026-10-21). The
 * `updateBlock` tool reads the layout, changes the fields of one block and
 * writes the list back whole; this is the change it makes.
 */

type Block = { readonly id?: string | null; readonly blockType: string } & Record<string, unknown>

export type BlockPatch =
  | { readonly ok: true; readonly layout: Block[] }
  | { readonly ok: false; readonly error: string }

/**
 * A group (`labels`, `link`) is merged field by field, so `{ labels: { play } }`
 * keeps the other labels; a list (`videos`, `items`) or a rich text is replaced
 * whole, as sent.
 */
const isGroup = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !('root' in value)

const merge = (base: unknown, change: unknown): unknown => {
  if (!isGroup(base) || !isGroup(change)) return change
  const out: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(change)) out[key] = merge(base[key], value)
  return out
}

/**
 * `fieldsOf` names the fields of a block type: a key outside them is refused, since
 * Payload would drop it silently and the caller would believe the change landed.
 * `id` and `blockType` are not fields, so a block cannot be renamed or retyped.
 */
export const patchBlock = (
  layout: readonly Block[] | null | undefined,
  blockId: string,
  fields: Record<string, unknown>,
  fieldsOf: (blockType: string) => ReadonlySet<string> | undefined,
): BlockPatch => {
  const blocks = layout ?? []
  const index = blocks.findIndex((block) => block.id === blockId)
  if (index === -1) return { ok: false, error: `No block with id "${blockId}" in this locale.` }
  if (Object.keys(fields).length === 0) return { ok: false, error: 'No field to change.' }
  const blockType = blocks[index]?.blockType ?? ''
  const known = fieldsOf(blockType) ?? new Set<string>()
  const unknown = Object.keys(fields).filter((key) => !known.has(key))
  if (unknown.length > 0)
    return { ok: false, error: `Not a field of a ${blockType} block: ${unknown.join(', ')}.` }
  const next = blocks.map((block, i) => (i === index ? (merge(block, fields) as Block) : block))
  return { ok: true, layout: next }
}
