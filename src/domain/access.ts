import type { Access, PayloadRequest, Where } from 'payload'

// Every factory starts from a refusal: an absent user never opens anything,
// except the public reads below.

/**
 * The site has a single kind of account: an administrator of the `users`
 * collection. Any other principal (an API key of another collection, a future
 * MCP identity that is not a user) is not an administrator.
 */
export const isAdmin = ({ req }: { req: PayloadRequest }): boolean =>
  req.user?.collection === 'users'

export const adminOnly: Access = ({ req }) => isAdmin({ req })

/** A document in the trash is never public, even when the caller asks for the trash. */
const notTrashed: Where = { deletedAt: { exists: false } }

/** Public read of published, untrashed documents. An administrator also reads drafts. */
export const publishedOrAdmin: Access = ({ req }) => {
  if (isAdmin({ req })) return true
  return { and: [{ _status: { equals: 'published' } }, notTrashed] }
}

/** Public read of untrashed media: they only exist to be shown on the site. */
export const untrashedOrAdmin: Access = ({ req }) => {
  if (isAdmin({ req })) return true
  return notTrashed
}

/** Public read of a global: it holds the navigation and footer, nothing else. */
export const publicRead: Access = () => true
