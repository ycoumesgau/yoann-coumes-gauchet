import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { footerLinkRel, SiteFrame } from '@/app/(frontend)/_lib/site-frame'
import type { Site } from '@/payload-types'

const site = (links: Site['links']): Site =>
  ({ id: 1, name: 'Name', navigation: [], links }) as Site

const render = (links: Site['links']) =>
  renderToStaticMarkup(
    // A server component without hooks: calling it is rendering it.
    SiteFrame({
      site: site(links),
      locale: 'en',
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
    expect(html).toContain('<a href="https://www.linkedin.com/in/someone" rel="me">LinkedIn</a>')
    expect(html).toContain('<a href="/privacy">Privacy</a>')
  })

  it('reads the scheme, whatever its case', () => {
    expect(footerLinkRel('HTTPS://example.com')).toBe('me')
    expect(footerLinkRel('http://example.com')).toBe('me')
    expect(footerLinkRel('/fr/privacy')).toBeUndefined()
    expect(footerLinkRel('mailto:someone@example.com')).toBeUndefined()
    expect(footerLinkRel('//example.com')).toBeUndefined()
  })
})
