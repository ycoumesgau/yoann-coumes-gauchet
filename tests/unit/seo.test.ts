import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  defaultMetaDescription,
  defaultMetaImage,
  defaultMetaTitle,
  excerpt,
  jsonLdScript,
  personJsonLd,
  resolveMeta,
  DEFAULT_SHARE_IMAGE,
  robotsRules,
  shareImage,
  sitemapEntries,
} from '@/domain/seo'

const origin = new URL('https://yoann.example')

describe('robots.txt', () => {
  it('lets every crawler read the pages and the media, never the admin, the APIs or OAuth', () => {
    const robots = robotsRules(origin)
    expect(robots.rules).toEqual([
      {
        userAgent: '*',
        allow: ['/', '/api/media/file/'],
        disallow: ['/admin', '/api/', '/oauth'],
      },
    ])
    expect(robots.sitemap).toBe('https://yoann.example/sitemap.xml')
  })

  it('names no sitemap without a public origin', () => {
    expect(robotsRules(undefined)).not.toHaveProperty('sitemap')
  })

  it('is no longer blocked by a noindex anywhere in the app or its headers', () => {
    const root = path.resolve(__dirname, '../..')
    const files = [
      ...readdirSync(path.join(root, 'src/app'), { recursive: true, encoding: 'utf8' })
        .filter((file) => /\.(ts|tsx)$/.test(file))
        .map((file) => path.join(root, 'src/app', file)),
      path.join(root, 'next.config.ts'),
      path.join(root, 'src/proxy.ts'),
    ]
    expect(files.length).toBeGreaterThan(5)
    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/noindex|index:\s*false|x-robots-tag/i)
    }
  })
})

describe('sitemap.xml', () => {
  it('lists each published language of a page, with absolute hreflang alternates', () => {
    const entries = sitemapEntries(origin, [
      { slug: 'home', published: ['en', 'fr'], updatedAt: '2026-10-21T00:00:00.000Z' },
      { slug: 'nexcan', published: ['en'] },
    ])
    expect(entries).toEqual([
      {
        url: 'https://yoann.example/en',
        lastModified: '2026-10-21T00:00:00.000Z',
        alternates: {
          languages: {
            en: 'https://yoann.example/en',
            fr: 'https://yoann.example/fr',
            'x-default': 'https://yoann.example/',
          },
        },
      },
      {
        url: 'https://yoann.example/fr',
        lastModified: '2026-10-21T00:00:00.000Z',
        alternates: {
          languages: {
            en: 'https://yoann.example/en',
            fr: 'https://yoann.example/fr',
            'x-default': 'https://yoann.example/',
          },
        },
      },
      {
        url: 'https://yoann.example/en/nexcan',
        alternates: {
          languages: {
            en: 'https://yoann.example/en/nexcan',
            'x-default': 'https://yoann.example/nexcan',
          },
        },
      },
    ])
  })

  it('is empty without a public origin: a sitemap needs absolute URLs', () => {
    expect(sitemapEntries(undefined, [{ slug: 'home', published: ['en'] }])).toEqual([])
  })
})

describe('page metadata fallbacks', () => {
  const layout = [
    { blockType: 'section', heading: 'Not this' },
    { blockType: 'hero', headline: 'The headline', subhead: '  The   lead.  ', image: 12 },
  ]

  it('titles a page with the site name, and home with the name alone', () => {
    expect(defaultMetaTitle('Nexcan', 'Yoann', 'nexcan')).toBe('Nexcan · Yoann')
    expect(defaultMetaTitle('Home', 'Yoann', 'home')).toBe('Yoann')
  })

  it("describes a page by its hero's lead, else its headline, else nothing", () => {
    expect(defaultMetaDescription(layout)).toBe('The lead.')
    expect(defaultMetaDescription([{ blockType: 'hero', headline: 'Only this' }])).toBe('Only this')
    expect(defaultMetaDescription([{ blockType: 'section' }])).toBeUndefined()
    expect(defaultMetaDescription(null)).toBeUndefined()
  })

  it("shares the hero's image", () => {
    expect(defaultMetaImage(layout)).toBe(12)
    expect(defaultMetaImage([])).toBeUndefined()
  })

  it('cuts a long description at a word, under the limit', () => {
    const cut = excerpt('one two three four', 12)
    expect(cut).toBe('one two…')
    expect(cut.length).toBeLessThanOrEqual(12)
    expect(excerpt('short', 12)).toBe('short')
  })
})

describe('share image', () => {
  it('takes a populated image, with its size and alt text', () => {
    expect(
      shareImage({
        url: '/api/media/file/a.webp',
        mimeType: 'image/webp',
        width: 1200,
        height: 630,
        alt: 'Yoann',
      }),
    ).toEqual({ url: '/api/media/file/a.webp', width: 1200, height: 630, alt: 'Yoann' })
  })

  it('refuses an id alone, a film, a Rive file and an SVG', () => {
    expect(shareImage(12)).toBeUndefined()
    expect(shareImage({ url: '/f.mp4', mimeType: 'video/mp4' })).toBeUndefined()
    expect(shareImage({ url: '/l.riv', mimeType: 'application/octet-stream' })).toBeUndefined()
    expect(shareImage({ url: '/l.svg', mimeType: 'image/svg+xml' })).toBeUndefined()
  })
})

describe('structured data', () => {
  it('claims a name, a URL and the web profiles, nothing else', () => {
    expect(
      personJsonLd({
        name: 'Yoann',
        url: 'https://yoann.example/en',
        links: [
          { url: 'https://www.linkedin.com/in/x' },
          { url: 'mailto:someone@example.com' },
          { url: '/privacy' },
        ],
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Yoann',
      url: 'https://yoann.example/en',
      sameAs: ['https://www.linkedin.com/in/x'],
    })
  })

  it('cannot close its script element', () => {
    expect(jsonLdScript({ name: '</script><script>alert(1)</script>' })).not.toContain('<')
  })
})

describe('page metadata', () => {
  const layout = [{ blockType: 'hero', headline: 'Headline', subhead: 'Lead.', image: 12 }]
  const page = { slug: 'nexcan', pageTitle: 'Nexcan', siteName: 'Yoann', layout }
  const image = { url: '/api/media/file/a.webp', mimeType: 'image/webp', width: 1200, height: 630 }

  it("prefers the editor's SEO fields to the page's own content", () => {
    expect(
      resolveMeta({ ...page, meta: { title: 'Mine', description: 'My words', image } }),
    ).toEqual({
      title: 'Mine',
      description: 'My words',
      image: { url: '/api/media/file/a.webp', width: 1200, height: 630 },
    })
  })

  it('falls back to the page, then to the portrait for the image', () => {
    expect(resolveMeta({ ...page, meta: { title: '', description: null } })).toEqual({
      title: 'Nexcan · Yoann',
      description: 'Lead.',
      image: DEFAULT_SHARE_IMAGE,
    })
  })
})
