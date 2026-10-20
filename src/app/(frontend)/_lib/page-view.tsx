import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { pagePath } from '@/domain/locale-routing'
import { defaultLocale, isLocale, type Locale } from '@/domain/locales'

import { findPublishedPage, getSitePayload, publishedLocales, siteOrigin } from './content'

/**
 * One page in one language. Not published in this language but in the other:
 * the visitor is sent there rather than shown a 404 or a mixed-language page.
 */

const resolveLocale = (raw: string): Locale => {
  if (!isLocale(raw)) notFound()
  return raw
}

export async function renderPage(rawLocale: string, slug: string) {
  const locale = resolveLocale(rawLocale)
  const payload = await getSitePayload()
  const page = await findPublishedPage(payload, slug, locale)
  if (!page) {
    const other = (await publishedLocales(payload, slug))[0]
    if (other) redirect(pagePath(other, slug))
    notFound()
  }
  return (
    <article>
      <h1>{page.title}</h1>
    </article>
  )
}

export async function pageMetadata(rawLocale: string, slug: string): Promise<Metadata> {
  if (!isLocale(rawLocale)) return {}
  const payload = await getSitePayload()
  const page = await findPublishedPage(payload, slug, rawLocale)
  if (!page) return {}
  const available = await publishedLocales(payload, slug)
  const languages: Record<string, string> = Object.fromEntries(
    available.map((locale) => [locale, pagePath(locale, slug)]),
  )
  if (available.includes(defaultLocale)) languages['x-default'] = pagePath(defaultLocale, slug)
  return {
    metadataBase: siteOrigin() ?? null,
    title: page.meta?.title || page.title,
    description: page.meta?.description || undefined,
    alternates: { canonical: pagePath(rawLocale, slug), languages },
  }
}
