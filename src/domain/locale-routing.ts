import { defaultLocale, isLocale, locales, type Locale } from './locales'

/**
 * Which language a visitor lands on, and which URL each language of a page
 * has. Pure: the proxy, the pages and the language switch call it, the tests
 * pin it.
 *
 * Yoann (2026-10-20): the browser's language decides, a switch is clearly
 * visible in the header, any other language falls back to English. The
 * session's choices on top, accepted with that answer: one URL per language,
 * and the switch's choice remembered in a cookie.
 */

/** The cookie the language switch writes; nothing else writes it. */
export const localeCookie = 'locale'

/** The visitor's languages from `Accept-Language`, best first (RFC 9110 §12.5.4). */
export const parseAcceptLanguage = (header: string | null | undefined): string[] => {
  if (!header) return []
  return (
    header
      .split(',')
      .slice(0, 32)
      .map((part) => {
        const [tag = '', ...params] = part.trim().split(';')
        const qParam = params.map((p) => p.trim().toLowerCase()).find((p) => p.startsWith('q='))
        const q = qParam === undefined ? 1 : Number(qParam.slice(2))
        return {
          tag: tag.trim().toLowerCase(),
          q: Number.isFinite(q) ? q : 0,
        }
      })
      .filter((entry) => entry.tag.length > 0 && entry.q > 0)
      // A stable sort: equal weights keep the header's order.
      .sort((a, b) => b.q - a.q)
      .map((entry) => entry.tag)
  )
}

/**
 * The remembered choice first, then the browser's first language the site
 * speaks (`fr-CA` counts as `fr`), then English. A `*` matches nothing in
 * particular, so it falls through to the default.
 */
export const negotiateLocale = (input: {
  readonly cookie?: string | null
  readonly acceptLanguage?: string | null
}): Locale => {
  if (input.cookie && isLocale(input.cookie)) return input.cookie
  for (const tag of parseAcceptLanguage(input.acceptLanguage)) {
    const primary = tag.split('-')[0] ?? ''
    if (isLocale(primary)) return primary
  }
  return defaultLocale
}

/** The locale a path starts with, if any: `/fr/nexcan` → `fr`. */
export const localeOfPath = (pathname: string): Locale | null => {
  const first = pathname.split('/')[1] ?? ''
  return isLocale(first) ? first : null
}

/** `/` + locale + slug, with `home` as the locale's root. */
export const pagePath = (locale: Locale, slug: string): string =>
  slug === 'home' ? `/${locale}` : `/${locale}/${slug}`

/**
 * Where each language of the switch leads from a page: the same page when it
 * is published in that language, otherwise that language's home. A click
 * never lands on a redirect back to where it started.
 */
export const languageLinks = (slug: string, published: readonly Locale[]): Record<Locale, string> =>
  Object.fromEntries(
    locales.map((locale) => [locale, pagePath(locale, published.includes(locale) ? slug : 'home')]),
  ) as Record<Locale, string>

/**
 * `hreflang` alternates: only the published languages, and `x-default` on the
 * URL without language, which the proxy resolves per visitor.
 */
export const alternateLanguages = (
  slug: string,
  published: readonly Locale[],
): Record<string, string> => {
  const languages: Record<string, string> = Object.fromEntries(
    published.map((locale) => [locale, pagePath(locale, slug)]),
  )
  if (published.length > 0) languages['x-default'] = slug === 'home' ? '/' : `/${slug}`
  return languages
}

export type PageDecision =
  | { readonly kind: 'render'; readonly locale: Locale }
  | { readonly kind: 'redirect'; readonly to: string; readonly permanent: boolean }
  | { readonly kind: 'not-found' }

/**
 * What a request for `/<locale>/<slug>` gets. `home` has one URL, the
 * language's root. A page not published in the requested language but in
 * another one redirects there (the session's choice: a visitor following a
 * shared link reads the page rather than a 404).
 */
export const decidePage = (input: {
  readonly locale: string
  readonly slug: string
  readonly viaSlugRoute: boolean
  readonly published: readonly Locale[]
}): PageDecision => {
  const { locale, slug, published } = input
  if (!isLocale(locale)) return { kind: 'not-found' }
  if (input.viaSlugRoute && slug === 'home') {
    return { kind: 'redirect', to: pagePath(locale, 'home'), permanent: true }
  }
  if (published.includes(locale)) return { kind: 'render', locale }
  const other = published[0]
  return other
    ? { kind: 'redirect', to: pagePath(other, slug), permanent: false }
    : { kind: 'not-found' }
}
