import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { alternateLanguages, decidePage, languageLinks, pagePath } from '@/domain/locale-routing'
import { isLocale } from '@/domain/locales'

import {
  findPublishedPage,
  findSite,
  getSitePayload,
  publishedLocales,
  siteOrigin,
} from './content'
import { SiteFrame } from './site-frame'

/** One page in one language; every redirect and 404 is `decidePage`'s. */
export async function renderPage(locale: string, slug: string, viaSlugRoute: boolean) {
  const payload = await getSitePayload()
  const published = isLocale(locale) ? await publishedLocales(payload, slug) : []
  const decision = decidePage({ locale, slug, viaSlugRoute, published })
  if (decision.kind === 'not-found') notFound()
  if (decision.kind === 'redirect') {
    if (decision.permanent) permanentRedirect(decision.to)
    redirect(decision.to)
  }

  const page = await findPublishedPage(payload, slug, decision.locale)
  if (!page) notFound()
  const site = await findSite(payload, decision.locale)
  return (
    <SiteFrame site={site} locale={decision.locale} languageLinks={languageLinks(slug, published)}>
      <article>
        <h1>{page.title}</h1>
      </article>
    </SiteFrame>
  )
}

export async function pageMetadata(locale: string, slug: string): Promise<Metadata> {
  if (!isLocale(locale)) return {}
  const payload = await getSitePayload()
  const page = await findPublishedPage(payload, slug, locale)
  if (!page) return {}
  const site = await findSite(payload, locale)
  return {
    metadataBase: siteOrigin() ?? null,
    title: page.meta?.title || `${page.title} · ${site.name}`,
    description: page.meta?.description || undefined,
    alternates: {
      canonical: pagePath(locale, slug),
      languages: alternateLanguages(slug, await publishedLocales(payload, slug)),
    },
  }
}
