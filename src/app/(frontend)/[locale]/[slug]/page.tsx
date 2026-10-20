import { permanentRedirect } from 'next/navigation'

import { pagePath } from '@/domain/locale-routing'
import { isLocale } from '@/domain/locales'

import { pageMetadata, renderPage } from '../../_lib/page-view'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const generateMetadata = async ({ params }: Props) => {
  const { locale, slug } = await params
  return pageMetadata(locale, slug)
}

export default async function SlugPage({ params }: Props) {
  const { locale, slug } = await params
  // `home` is served at the language's root only.
  if (slug === 'home' && isLocale(locale)) permanentRedirect(pagePath(locale, 'home'))
  return renderPage(locale, slug)
}
