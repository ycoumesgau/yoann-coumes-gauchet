import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { isLocale, locales } from '@/domain/locales'
import { previewPath } from '@/domain/preview'

import { PageTitle, RenderBlocks } from '../../../_blocks/render-blocks'
import { findSite, getSitePayload, readPreviewPage } from '../../../_lib/content'
import { RefreshOnSave, StayInPreview } from '../../../_lib/refresh-on-save'
import { SiteFrame } from '../../../_lib/site-frame'

type Props = { params: Promise<{ locale: string; slug: string }> }

/**
 * The live preview `/admin` frames: a page's latest draft in one language.
 * Anyone but a signed-in administrator gets a 404, as for a page that does not
 * exist, so a crawler never sees it.
 */
export default async function PreviewPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const payload = await getSitePayload()
  const page = await readPreviewPage(payload, await headers(), slug, locale)
  if (!page) notFound()
  const site = await findSite(payload, locale)
  const languageLinks = Object.fromEntries(
    locales.map((code) => [code, previewPath(code, slug)]),
  ) as Record<(typeof locales)[number], string>

  return (
    <SiteFrame site={site} locale={locale} slug={slug} languageLinks={languageLinks}>
      <RefreshOnSave />
      <StayInPreview />
      <article>
        <PageTitle page={page} />
        <RenderBlocks
          blocks={page.layout ?? []}
          locale={locale}
          labels={site.labels}
          filmTexts={site.filmTexts}
        />
      </article>
    </SiteFrame>
  )
}
