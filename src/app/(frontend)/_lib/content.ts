import { getPayload, type Payload, type PayloadRequest } from 'payload'

import { isAdminUser } from '@/domain/access'
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
  // 0 to know whether it exists; 1 for its metadata (share image); 2 to render it
  // (blocks → projects → their page and image).
  depth: 0 | 1 | 2 = 0,
): Promise<Page | null> => {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    depth,
    ...anonymous,
  })
  // The anonymous read filters on the requested language's `_status`.
  return docs[0] ?? null
}

/**
 * A page's latest draft in one language, for the live preview. Read as the
 * caller, never past access: only an administrator reads a draft, anyone
 * else gets what the public sees. The preview route refuses them first.
 */
export const findPreviewPage = async (
  payload: Payload,
  slug: string,
  locale: Locale,
  user: NonNullable<PayloadRequest['user']>,
): Promise<Page | null> => {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    depth: 2,
    draft: true,
    overrideAccess: false,
    user,
    fallbackLocale: false,
  })
  return docs[0] ?? null
}

/**
 * What the preview route serves for a request: the draft for a signed-in
 * administrator, `null` for anyone else (a visitor, an API key), which the
 * route turns into a 404.
 */
export const readPreviewPage = async (
  payload: Payload,
  headers: Headers,
  slug: string,
  locale: Locale,
): Promise<Page | null> => {
  const { user } = await payload.auth({ headers })
  if (!user || !isAdminUser(user)) return null
  return findPreviewPage(payload, slug, locale, user)
}

/** Every page published in a language (slug and date only), for the sitemap. */
export const findPublishedPages = async (
  payload: Payload,
  locale: Locale,
): Promise<{ slug: string; updatedAt: string }[]> => {
  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    depth: 0,
    limit: 0,
    pagination: false,
    select: { slug: true, updatedAt: true },
    ...anonymous,
  })
  return docs.map((page) => ({ slug: page.slug, updatedAt: page.updatedAt }))
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
