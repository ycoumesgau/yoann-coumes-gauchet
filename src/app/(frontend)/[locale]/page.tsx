import { pageMetadata, renderPage } from '../_lib/page-view'

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }) =>
  pageMetadata((await params).locale, 'home')

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  return renderPage((await params).locale, 'home')
}
