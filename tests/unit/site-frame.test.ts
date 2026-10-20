import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { footerLinkHref, footerLinkRel, SiteFrame } from '@/app/(frontend)/_lib/site-frame'
import type { Locale } from '@/domain/locales'
import type { Site } from '@/payload-types'

const site = (links: Site['links']): Site =>
  ({ id: 1, name: 'Name', navigation: [], links }) as Site

const render = (links: Site['links'], locale: Locale = 'en') =>
  renderToStaticMarkup(
    // A server component without hooks: calling it is rendering it.
    SiteFrame({
      site: site(links),
      locale,
      languageLinks: { en: '/en', fr: '/fr' },
      children: null,
    }),
  )

describe('footer links', () => {
  it('marks an external profile as the same person, not a page of the site', () => {
    const html = render([
      { id: 'a', label: 'LinkedIn', url: 'https://www.linkedin.com/in/someone' },
      { id: 'b', label: 'Privacy', url: '/privacy' },
    ])
    expect(html).toContain(
      '<a href="https://www.linkedin.com/in/someone" rel="me" target="_blank">LinkedIn</a>',
    )
    expect(html).toContain('<a href="/en/privacy">Privacy</a>')
  })

  it("keeps a page of the site in the reader's language", () => {
    expect(render([{ id: 'b', label: 'Confidentialité', url: '/privacy' }], 'fr')).toContain(
      '<a href="/fr/privacy">Confidentialité</a>',
    )
    expect(footerLinkHref('fr', '/')).toBe('/fr')
    expect(footerLinkHref('fr', '/en/privacy')).toBe('/en/privacy')
    expect(footerLinkHref('fr', '//example.com')).toBe('//example.com')
    expect(footerLinkHref('fr', 'https://example.com/a')).toBe('https://example.com/a')
  })

  it('reads the scheme at the start, whatever its case', () => {
    expect(footerLinkRel('HTTPS://example.com')).toBe('me')
    expect(footerLinkRel('http://example.com')).toBe('me')
    expect(footerLinkRel('/fr/privacy')).toBeUndefined()
    expect(footerLinkRel('/go?to=https://example.com')).toBeUndefined()
    expect(footerLinkRel('https:example.com')).toBeUndefined()
    expect(footerLinkRel('mailto:someone@example.com')).toBeUndefined()
    expect(footerLinkRel('//example.com')).toBeUndefined()
  })
})

describe('skip link', () => {
  it('jumps to the content with the words the site gives it, and is absent without them', () => {
    const withLabel = renderToStaticMarkup(
      SiteFrame({
        site: { ...site([]), labels: { skipToContent: 'Skip to content' } } as Site,
        locale: 'en',
        languageLinks: { en: '/en', fr: '/fr' },
        children: null,
      }),
    )
    expect(withLabel).toContain('<a class="skip-link" href="#main">Skip to content</a>')
    expect(withLabel).toContain('<main id="main">')
    expect(render([])).not.toContain('skip-link')
  })
})

describe('footer links at render', () => {
  it('leaves out a link the validator would refuse', () => {
    const html = render([
      { id: 'a', label: 'Bad', url: 'javascript:alert(1)' },
      { id: 'b', label: 'Mail', url: 'mailto:someone@example.com' },
    ] as Site['links'])
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('>Bad<')
    expect(html).toContain('href="mailto:someone@example.com"')
  })
})
