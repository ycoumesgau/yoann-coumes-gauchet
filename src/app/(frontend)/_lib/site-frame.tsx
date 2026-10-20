import type React from 'react'

import { localeOfPath, pagePath } from '@/domain/locale-routing'
import type { Locale } from '@/domain/locales'
import type { Site } from '@/payload-types'

import { LanguageSwitch } from './language-switch'
import { ThemeToggle } from './theme-toggle'

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

/** A footer link leaves the site in a new tab only when it is a web address. */
const external = (url: string) => /^https?:\/\//i.test(url)

/** Header (name, navigation, theme, language) and footer around a page. */
export function SiteFrame({
  site,
  locale,
  slug,
  languageLinks,
  children,
}: {
  site: Site
  locale: Locale
  slug?: string
  languageLinks: Readonly<Record<Locale, string>>
  children: React.ReactNode
}) {
  const labels = site.labels ?? {}
  const navigation = (site.navigation ?? []).flatMap((item) =>
    // A page not published in this language comes back as a bare id: no link.
    item.label && typeof item.page === 'object' && item.page?.slug
      ? [{ key: item.id ?? item.page.slug, slug: item.page.slug, label: item.label }]
      : [],
  )
  const navLinks = navigation.map((item) => (
    <a
      key={item.key}
      href={pagePath(locale, item.slug)}
      aria-current={item.slug === slug ? 'page' : undefined}
    >
      {item.label}
    </a>
  ))
  const tools = (
    <>
      {labels.dark && labels.light ? <ThemeToggle dark={labels.dark} light={labels.light} /> : null}
      <LanguageSwitch current={locale} links={languageLinks} />
    </>
  )
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <a className="brand" href={pagePath(locale, 'home')}>
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">{site.name}</span>
          </a>
          <nav className="site-nav desktop">
            {navLinks}
            {tools}
          </nav>
          <details className="menu">
            <summary>
              <span className="when-closed">{labels.menu}</span>
              <span className="when-open">{labels.closeMenu}</span>
            </summary>
            <nav className="menu-panel">
              {navLinks}
              <div className="menu-tools">{tools}</div>
            </nav>
          </details>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="wrap">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">{site.name}</span>
          </span>
          {site.links?.length ? (
            <span className="footer-links">
              {site.links.map((link) =>
                link.label ? (
                  <a
                    key={link.id ?? link.url}
                    href={footerLinkHref(locale, link.url)}
                    rel={footerLinkRel(link.url)}
                    target={external(link.url) ? '_blank' : undefined}
                  >
                    {link.label}
                  </a>
                ) : null,
              )}
            </span>
          ) : null}
        </div>
      </footer>
    </>
  )
}
