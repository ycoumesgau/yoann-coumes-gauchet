import '@fontsource-variable/newsreader/opsz.css'
import '@fontsource-variable/schibsted-grotesk/index.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type React from 'react'

import { isLocale } from '@/domain/locales'

import { modeScript } from '../_lib/mode'
import './styles.css'

export const dynamic = 'force-dynamic'

// Not indexed until launch (L5). Titles come from Payload, page by page.
export const metadata: Metadata = { robots: { index: false, follow: false } }

/** Every public page sits under its language, which sets `lang` on the document. */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Before the first paint, so a reader who chose dark never sees light flash. */}
        <script dangerouslySetInnerHTML={{ __html: modeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
