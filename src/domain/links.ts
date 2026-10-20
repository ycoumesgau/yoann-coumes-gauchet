/** A link that leaves the site: a web address or an email address, nothing else. */
export const isOutboundUrl = (url: string): boolean => /^(https?:\/\/|mailto:)/i.test(url)

/**
 * A footer link is a web address, or a path on this site (`/privacy`); any
 * other scheme (`javascript:`, `data:`) is refused before it is stored.
 */
export const footerLinkUrl = (value: unknown): true | string => {
  if (typeof value !== 'string' || value.length === 0) return 'A URL is required.'
  if (/^https?:\/\//i.test(value)) return true
  if (value.startsWith('/') && !value.startsWith('//')) return true
  return 'Use a full https:// address, or a path of this site such as /privacy.'
}
