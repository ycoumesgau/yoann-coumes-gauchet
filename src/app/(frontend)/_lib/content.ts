import { getPayload, type Payload } from 'payload'

import { locales, type Locale } from '@/domain/locales'
import { parsePublicUrl } from '@/domain/mcp-oauth/config'
import type { Page, Site } from '@/payload-types'
import config from '@/payload.config'

/**
 * What the public site reads, always as an anonymous caller and in one
 * language only: a French URL never shows English text (Payload stores
 * `_status` per locale; `decidePage` says where a missing language leads).
 */

const anonymous = {
  overrideAccess: false,
  user: null,
  fallbackLocale: false,
} as const

export const getSitePayload = async (): Promise<Payload> => getPayload({ config: await config })

export const findPublishedPage = async (
  payload: Payload,
  slug: string,
  locale: Locale,
): Promise<Page | null> => {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    depth: 1,
    ...anonymous,
  })
  // The anonymous read filters on the requested language's `_status`.
  return docs[0] ?? null
}

/** The languages a page is published in, for `hreflang` and the language switch. */
export const publishedLocales = async (payload: Payload, slug: string): Promise<Locale[]> => {
  const found = await Promise.all(
    locales.map(async (locale) =>
      (await findPublishedPage(payload, slug, locale)) ? locale : null,
    ),
  )
  return found.filter((locale): locale is Locale => locale !== null)
}

export const findSite = async (payload: Payload, locale: Locale): Promise<Site> =>
  payload.findGlobal({ slug: 'site', locale, depth: 1, ...anonymous })

/** The public origin, for absolute `hreflang` and canonical URLs; none outside production. */
export const siteOrigin = (): URL | undefined => {
  const origin = process.env.SITE_URL ? parsePublicUrl(process.env.SITE_URL.trim()) : null
  return origin ? new URL(origin) : undefined
}
