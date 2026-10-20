import { pageMetadata, renderPage } from '../../_lib/page-view'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const generateMetadata = async ({ params }: Props) => {
  const { locale, slug } = await params
  return pageMetadata(locale, slug)
}

export default async function SlugPage({ params }: Props) {
  const { locale, slug } = await params
  return renderPage(locale, slug, true)
}
