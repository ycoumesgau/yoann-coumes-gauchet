import { pageMetadata, renderPage } from '../_lib/page-view'

type Props = { params: Promise<{ locale: string }> }

export const generateMetadata = async ({ params }: Props) =>
  pageMetadata((await params).locale, 'home')

export default async function HomePage({ params }: Props) {
  return renderPage((await params).locale, 'home', false)
}
