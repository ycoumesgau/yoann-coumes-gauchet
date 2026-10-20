import type React from 'react'

import { pagePath } from '@/domain/locale-routing'
import type { Locale } from '@/domain/locales'
import type { Site } from '@/payload-types'

import { LanguageSwitch } from './language-switch'

/**
 * `rel="me"` claims the linked page is the same person's profile: only for an
 * external link, never for one of the site's own pages (the privacy page).
 */
export const footerLinkRel = (url: string): 'me' | undefined =>
  /^https?:\/\//i.test(url) ? 'me' : undefined

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
              <a key={link.id ?? link.url} href={link.url} rel={footerLinkRel(link.url)}>
                {link.label}
              </a>
            ) : null,
          )}
        </footer>
      ) : null}
    </>
  )
}
