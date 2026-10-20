import type { Access, PayloadRequest } from 'payload'

// Every factory starts from a refusal: an absent user never opens anything,
// except the published-content read below.

/** The site has a single kind of account: an administrator. */
export const isAdmin = ({ req }: { req: PayloadRequest }): boolean => Boolean(req.user)

export const adminOnly: Access = ({ req }) => isAdmin({ req })

/**
 * Public read of published documents only. An administrator also reads drafts.
 * The only access in the repo that answers something to an anonymous caller.
 */
export const publishedOrAdmin: Access = ({ req }) => {
  if (isAdmin({ req })) return true
  return { _status: { equals: 'published' } }
}
