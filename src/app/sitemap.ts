import type { MetadataRoute } from 'next'

import { locales, type Locale } from '@/domain/locales'
import { sitemapEntries } from '@/domain/seo'

import { findPublishedPages, getSitePayload, siteOrigin } from './(frontend)/_lib/content'

// Read at each request: the database is not reachable at build time.
export const dynamic = 'force-dynamic'

/** Every published page, in each language it is published in (read as an anonymous caller). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin()
  if (!origin) return []
  const payload = await getSitePayload()
  const bySlug = new Map<string, { published: Locale[]; updatedAt?: string }>()
  for (const locale of locales) {
    for (const page of await findPublishedPages(payload, locale)) {
      const entry = bySlug.get(page.slug) ?? { published: [] }
      entry.published.push(locale)
      if (!entry.updatedAt || page.updatedAt > entry.updatedAt) entry.updatedAt = page.updatedAt
      bySlug.set(page.slug, entry)
    }
  }
  return sitemapEntries(
    origin,
    [...bySlug].map(([slug, entry]) => ({ slug, ...entry })),
  )
}
