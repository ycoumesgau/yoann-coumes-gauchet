import type React from 'react'

import { localeOfPath, pagePath } from '@/domain/locale-routing'
import type { Locale } from '@/domain/locales'
import type { Site } from '@/payload-types'

import { LanguageSwitch } from './language-switch'

/**
 * `rel="me"` claims the linked page is the same person's profile: given to an
 * absolute `http(s)` URL, never to a path on this site (the privacy page). It
 * reads the scheme, not the host: a site page belongs in the footer as a path.
 */
export const footerLinkRel = (url: string): 'me' | undefined =>
  /^https?:\/\//i.test(url) ? 'me' : undefined

/**
 * A footer path without a language (`/privacy`) stays in the page's language
 * (`/fr/privacy`), instead of a redirect that would pick the browser's.
 */
export const footerLinkHref = (locale: Locale, url: string): string =>
  url.startsWith('/') && !url.startsWith('//') && localeOfPath(url) === null
    ? url === '/'
      ? pagePath(locale, 'home')
      : `/${locale}${url}`
    : url

/** Header (name, navigation, language switch) and footer around a page. */
export function SiteFrame({
  site,
  locale,
  languageLinks,
  children,
}: {
  site: Site
  locale: Locale
  languageLinks: Readonly<Record<Locale, string>>
  children: React.ReactNode
}) {
  return (
    <>
      <header className="site-header">
        <a className="site-name" href={pagePath(locale, 'home')}>
          {site.name}
        </a>
        <nav>
          {(site.navigation ?? []).map((item) =>
            // A page not published in this language comes back as a bare id: no link.
            item.label && typeof item.page === 'object' && item.page?.slug ? (
              <a key={item.id ?? item.page.slug} href={pagePath(locale, item.page.slug)}>
                {item.label}
              </a>
            ) : null,
          )}
        </nav>
        <LanguageSwitch current={locale} links={languageLinks} />
      </header>
      <main>{children}</main>
      {site.links?.length ? (
        <footer>
          {site.links.map((link) =>
            link.label ? (
              <a
                key={link.id ?? link.url}
                href={footerLinkHref(locale, link.url)}
                rel={footerLinkRel(link.url)}
              >
                {link.label}
              </a>
            ) : null,
          )}
        </footer>
      ) : null}
    </>
  )
}
