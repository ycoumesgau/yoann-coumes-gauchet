import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type React from 'react'

import { pagePath } from '@/domain/locale-routing'
import { isLocale } from '@/domain/locales'

import { findSite, getSitePayload } from '../_lib/content'
import { LanguageSwitch } from '../_lib/language-switch'

import './styles.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Yoann Coumes-Gauchet',
  // Not indexed until launch (L5).
  robots: { index: false, follow: false },
}

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
  const site = await findSite(await getSitePayload(), locale)

  return (
    <html lang={locale}>
      <body>
        <header className="site-header">
          <a className="site-name" href={pagePath(locale, 'home')}>
            {site.name}
          </a>
          <nav>
            {(site.navigation ?? []).map((item) =>
              item.label && typeof item.page === 'object' && item.page?.slug ? (
                <a key={item.id ?? item.page.slug} href={pagePath(locale, item.page.slug)}>
                  {item.label}
                </a>
              ) : null,
            )}
          </nav>
          <LanguageSwitch current={locale} />
        </header>
        <main>{children}</main>
        {site.links?.length ? (
          <footer>
            {site.links.map((link) =>
              link.label ? (
                <a key={link.id ?? link.url} href={link.url} rel="me">
                  {link.label}
                </a>
              ) : null,
            )}
          </footer>
        ) : null}
      </body>
    </html>
  )
}
