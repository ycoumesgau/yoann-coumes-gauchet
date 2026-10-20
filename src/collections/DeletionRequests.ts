import { APIError, type CollectionConfig } from 'payload'

import { adminOnly, adminOutsideMcp, closed, closedField } from '@/domain/access'
import {
  decideDeletionTransition,
  deletableCollections,
  deletionStatuses,
  isDeletableCollection,
} from '@/domain/mcp-oauth/deletion'

/**
 * Permanent deletions asked by Claude, confirmed by Yoann (ADR-2 §4). The MCP
 * tool creates a request for a document already in the trash; setting the
 * status to `confirmed` in `/admin` deletes it for good. The MCP server cannot
 * update this collection, so the model cannot confirm its own request.
 */
export const DeletionRequests: CollectionConfig = {
  slug: 'deletion-requests',
  labels: { singular: 'Deletion request', plural: 'Deletion requests' },
  admin: {
    useAsTitle: 'targetTitle',
    defaultColumns: ['targetTitle', 'targetCollection', 'status', 'createdAt'],
    description:
      'Asked by Claude. Set the status to "confirmed" to delete the document for good, or "cancelled".',
  },
  access: { read: adminOnly, create: adminOnly, update: adminOutsideMcp, delete: closed },
  versions: false,
  fields: [
    {
      name: 'targetCollection',
      type: 'select',
      required: true,
      options: [...deletableCollections],
      access: { update: closedField },
    },
    { name: 'targetId', type: 'text', required: true, access: { update: closedField } },
    { name: 'targetTitle', type: 'text', required: true, access: { update: closedField } },
    { name: 'reason', type: 'textarea', access: { update: closedField } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [...deletionStatuses],
    },
    { name: 'decidedAt', type: 'date', admin: { readOnly: true } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (operation === 'create') {
          // A request is born pending, whatever the caller sent.
          return { ...data, status: 'pending', decidedAt: null }
        }
        const previous = originalDoc as {
          status: unknown
          createdAt: string
          targetCollection: unknown
          targetId: string
        }
        const decision = decideDeletionTransition(previous, data.status, new Date())
        if (!decision.ok) {
          throw new APIError(`This request cannot change status (${decision.reason}).`, 400)
        }
        if (!decision.deleteTarget) {
          return data.status === previous.status
            ? data
            : { ...data, decidedAt: new Date().toISOString() }
        }
        if (!isDeletableCollection(previous.targetCollection)) {
          throw new APIError('Unknown target collection.', 400)
        }
        // Same request, same user: access is enforced on the deletion itself.
        await req.payload.delete({
          collection: previous.targetCollection,
          id: previous.targetId,
          trash: true,
          overrideAccess: false,
          req,
        })
        return { ...data, decidedAt: new Date().toISOString() }
      },
    ],
  },
}
