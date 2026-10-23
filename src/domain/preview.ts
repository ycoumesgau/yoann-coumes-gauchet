import { localeOfPath } from './locale-routing'
import { isLocale, locales, type Locale } from './locales'

/**
 * Live preview: `/admin` frames a page's draft at `/<locale>/preview/<slug>`.
 * Only an administrator reads it (`publishedOrAdmin`); anyone else gets a 404.
 * The segment is reserved: no page may take `preview` as its slug.
 */
export const previewSegment = 'preview'

export const previewPath = (locale: Locale, slug: string): string =>
  `/${locale}/${previewSegment}/${slug}`

/**
 * The path `/admin` frames. A path, not a URL: the admin makes it absolute in
 * the browser, on the origin the administrator is on; the server's request has
 * no URL there and would give `http://`, which an https page cannot frame.
 * `null` hides the preview (a new page has no slug yet, or the locale is not
 * the site's).
 */
export const previewUrl = ({
  locale,
  slug,
}: {
  locale: string | undefined
  slug: unknown
}): string | null => {
  if (!locale || !isLocale(locale)) return null
  if (typeof slug !== 'string' || slug.length === 0) return null
  return previewPath(locale, slug)
}

/**
 * Where a link clicked inside the preview leads: a page of the site opens as
 * its preview, since a public page refuses to be framed and would leave a
 * blank frame. Anything else (another site, a file, an anchor, a preview
 * already) is `null`: left as it is.
 */
export const previewHref = (pathname: string): string | null => {
  const locale = localeOfPath(pathname)
  if (!locale) return null
  const rest = pathname.split('/').slice(2).filter(Boolean)
  if (rest.length === 0) return previewPath(locale, 'home')
  if (rest.length === 1 && rest[0] !== previewSegment) return previewPath(locale, rest[0]!)
  return null
}

/**
 * Every page refuses to be framed (`next.config.ts`); the preview, framed by
 * `/admin` on the same origin, is the one exception, and only by that origin.
 * Next lets the last matching rule set a header, so this one comes after.
 */
export const previewFrameSource = `/:locale(${locales.join('|')})/${previewSegment}/:slug`
