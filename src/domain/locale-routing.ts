import { defaultLocale, isLocale, type Locale } from './locales'

/**
 * Which language a visitor lands on, and how a path changes language. Pure:
 * the proxy and the language switch call it, the tests pin it.
 *
 * Yoann's rule (2026-10-20): the browser's language decides, a visible switch
 * overrides it and is remembered, and any other language falls back to English.
 */

/** The cookie the language switch writes; nothing else writes it. */
export const localeCookie = 'locale'

/** The visitor's languages from `Accept-Language`, best first (RFC 9110 §12.5.4). */
export const parseAcceptLanguage = (header: string | null | undefined): string[] => {
  if (!header) return []
  return header
    .split(',')
    .slice(0, 32)
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';')
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
      const q = qParam === undefined ? 1 : Number(qParam.slice(2))
      return {
        tag: tag.trim().toLowerCase(),
        q: Number.isFinite(q) ? q : 0,
        index,
      }
    })
    .filter((entry) => entry.tag.length > 0 && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map((entry) => entry.tag)
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

/** The same path in another language: `/en/nexcan` → `/fr/nexcan`. */
export const switchLocaleOfPath = (pathname: string, target: Locale): string => {
  const current = localeOfPath(pathname)
  if (!current) return `/${target}`
  return `/${target}${pathname.slice(current.length + 1)}`
}
