/**
 * Permanent deletion through the MCP server (ADR-2 §4): the model may ask, only
 * Yoann confirms, from `/admin`. Pure decisions; the hooks apply them.
 */
export const deletableCollections = ['pages', 'projects', 'media'] as const
export type DeletableCollection = (typeof deletableCollections)[number]

export const isDeletableCollection = (value: unknown): value is DeletableCollection =>
  typeof value === 'string' && (deletableCollections as readonly string[]).includes(value)

export const deletionStatuses = ['pending', 'confirmed', 'cancelled'] as const
export type DeletionStatus = (typeof deletionStatuses)[number]

/** A request left unanswered for a day is stale: the model asks again if it still matters. */
export const DELETION_REQUEST_TTL_SECONDS = 24 * 60 * 60

export type DeletionTransition =
  | { readonly ok: true; readonly deleteTarget: boolean }
  | { readonly ok: false; readonly reason: 'not-pending' | 'expired' | 'invalid' }

/** Only pending → confirmed (which deletes) or pending → cancelled. A decision is final. */
export const decideDeletionTransition = (
  previous: { readonly status: unknown; readonly createdAt: string },
  next: unknown,
  now: Date,
): DeletionTransition => {
  if (next === previous.status) return { ok: true, deleteTarget: false }
  if (previous.status !== 'pending') return { ok: false, reason: 'not-pending' }
  if (next === 'cancelled') return { ok: true, deleteTarget: false }
  if (next !== 'confirmed') return { ok: false, reason: 'invalid' }
  const ageMs = now.getTime() - Date.parse(previous.createdAt)
  if (!(ageMs < DELETION_REQUEST_TTL_SECONDS * 1000)) return { ok: false, reason: 'expired' }
  return { ok: true, deleteTarget: true }
}
