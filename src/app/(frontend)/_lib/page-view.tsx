import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { alternateLanguages, decidePage, languageLinks, pagePath } from '@/domain/locale-routing'
import { isLocale, locales } from '@/domain/locales'
import { jsonLdScript, openGraphLocale, personJsonLd, resolveMeta } from '@/domain/seo'

import { PageTitle, RenderBlocks } from '../_blocks/render-blocks'
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

  const page = await findPublishedPage(payload, slug, decision.locale, 2)
  if (!page) notFound()
  const site = await findSite(payload, decision.locale)
  return (
    <SiteFrame
      site={site}
      locale={decision.locale}
      slug={slug}
      languageLinks={languageLinks(slug, published)}
    >
      {slug === 'home' ? <PersonData site={site} url={pagePath(decision.locale, 'home')} /> : null}
      <article>
        <PageTitle page={page} />
        <RenderBlocks
          blocks={page.layout ?? []}
          locale={decision.locale}
          labels={site.labels}
          filmTexts={site.filmTexts}
        />
      </article>
    </SiteFrame>
  )
}

/** Who the site is about, for search engines: the name and the profiles in the footer. */
function PersonData({ site, url }: { site: Awaited<ReturnType<typeof findSite>>; url: string }) {
  const origin = siteOrigin()
  if (!origin) return null
  const data = personJsonLd({
    name: site.name,
    url: new URL(url, origin).href,
    links: site.links ?? [],
  })
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />
  )
}

/**
 * Title, description, share image, canonical and `hreflang`. What the editor
 * left empty in the page's SEO fields falls back to the page itself: its
 * title with the site's name, its hero's lead, its hero's image.
 */
export async function pageMetadata(locale: string, slug: string): Promise<Metadata> {
  if (!isLocale(locale)) return {}
  const payload = await getSitePayload()
  const page = await findPublishedPage(payload, slug, locale, 1)
  if (!page) return {}
  const site = await findSite(payload, locale)
  const published = await publishedLocales(payload, slug)
  const { title, description, image } = resolveMeta({
    slug,
    pageTitle: page.title,
    siteName: site.name,
    meta: page.meta,
    layout: page.layout,
  })
  const images = [image]
  return {
    metadataBase: siteOrigin() ?? null,
    title,
    description,
    alternates: {
      canonical: pagePath(locale, slug),
      languages: alternateLanguages(slug, published),
    },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title,
      description,
      url: pagePath(locale, slug),
      locale: openGraphLocale[locale],
      alternateLocale: locales
        .filter((other) => other !== locale && published.includes(other))
        .map((other) => openGraphLocale[other]),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  }
}
