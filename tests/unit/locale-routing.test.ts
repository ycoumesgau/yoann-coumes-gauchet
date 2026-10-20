import { createRequire } from 'node:module'

import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import {
  alternateLanguages,
  decidePage,
  languageLinks,
  localeOfPath,
  negotiateLocale,
  pagePath,
  parseAcceptLanguage,
} from '@/domain/locale-routing'
import { config, proxy } from '@/proxy'

// Next's own matcher compiler; exported at runtime but not in its type declarations.
const { getMiddlewareMatchers } = createRequire(import.meta.url)(
  'next/dist/build/analysis/get-page-static-info.js',
) as {
  getMiddlewareMatchers: (matcher: readonly string[], nextConfig: object) => { regexp: string }[]
}

describe('negotiateLocale', () => {
  it.each([
    ['fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7', 'fr'],
    ['en-GB,en;q=0.9,fr;q=0.8', 'en'],
    ['fr-CA', 'fr'],
    // Neither language spoken: English (Yoann, 2026-10-20).
    ['de-DE,de;q=0.9', 'en'],
    ['de;q=1,fr;q=0.5', 'fr'],
    ['en;q=0.2,fr;q=0.8', 'fr'],
    ['fr;q=0,en;q=0.1', 'en'],
    ['*', 'en'],
    ['', 'en'],
  ])('reads %j as %s', (acceptLanguage, expected) => {
    expect(negotiateLocale({ acceptLanguage })).toBe(expected)
  })

  it('lets the remembered choice win over the browser', () => {
    expect(negotiateLocale({ cookie: 'en', acceptLanguage: 'fr-FR' })).toBe('en')
    expect(negotiateLocale({ cookie: 'fr', acceptLanguage: 'en-US' })).toBe('fr')
  })

  it('ignores a cookie that is not a language of the site', () => {
    expect(negotiateLocale({ cookie: 'de', acceptLanguage: 'fr' })).toBe('fr')
    expect(negotiateLocale({ cookie: '../admin', acceptLanguage: null })).toBe('en')
  })

  it('keeps the order of equal weights and drops malformed weights', () => {
    expect(parseAcceptLanguage('fr, en')).toEqual(['fr', 'en'])
    expect(parseAcceptLanguage('fr;q=abc, en')).toEqual(['en'])
    expect(parseAcceptLanguage('fr;Q=0.5, en;q=0.9')).toEqual(['en', 'fr'])
  })
})

describe('paths', () => {
  it('serves home at the language root', () => {
    expect(pagePath('fr', 'home')).toBe('/fr')
    expect(pagePath('en', 'nexcan')).toBe('/en/nexcan')
  })

  it('reads a language only from a whole first segment', () => {
    expect(localeOfPath('/fr/nexcan')).toBe('fr')
    expect(localeOfPath('/fr')).toBe('fr')
    expect(localeOfPath('/english')).toBeNull()
    expect(localeOfPath('/')).toBeNull()
  })
})

describe('languageLinks', () => {
  it('leads to the same page when it exists in that language', () => {
    expect(languageLinks('nexcan', ['en', 'fr'])).toEqual({ en: '/en/nexcan', fr: '/fr/nexcan' })
  })

  it("leads to the language's home when the page is not published in it", () => {
    expect(languageLinks('nexcan', ['en'])).toEqual({ en: '/en/nexcan', fr: '/fr' })
  })
})

describe('alternateLanguages', () => {
  it('lists only the published languages, x-default on the URL without language', () => {
    expect(alternateLanguages('nexcan', ['en'])).toEqual({
      en: '/en/nexcan',
      'x-default': '/nexcan',
    })
    expect(alternateLanguages('home', ['en', 'fr'])).toEqual({
      en: '/en',
      fr: '/fr',
      'x-default': '/',
    })
    expect(alternateLanguages('nexcan', [])).toEqual({})
  })
})

describe('decidePage', () => {
  const both = ['en', 'fr'] as const

  it('renders a page published in the requested language', () => {
    expect(
      decidePage({ locale: 'fr', slug: 'nexcan', viaSlugRoute: true, published: both }),
    ).toEqual({
      kind: 'render',
      locale: 'fr',
    })
  })

  it('keeps one URL for home', () => {
    expect(decidePage({ locale: 'en', slug: 'home', viaSlugRoute: true, published: both })).toEqual(
      {
        kind: 'redirect',
        to: '/en',
        permanent: true,
      },
    )
    expect(
      decidePage({ locale: 'en', slug: 'home', viaSlugRoute: false, published: both }).kind,
    ).toBe('render')
  })

  it('sends a missing language to the published one, temporarily', () => {
    expect(
      decidePage({ locale: 'fr', slug: 'nexcan', viaSlugRoute: true, published: ['en'] }),
    ).toEqual({
      kind: 'redirect',
      to: '/en/nexcan',
      permanent: false,
    })
  })

  it('answers 404 to an unknown language or an unpublished page', () => {
    expect(
      decidePage({ locale: 'de', slug: 'nexcan', viaSlugRoute: true, published: both }).kind,
    ).toBe('not-found')
    expect(
      decidePage({ locale: 'en', slug: 'nexcan', viaSlugRoute: true, published: [] }).kind,
    ).toBe('not-found')
  })
})

const visit = (path: string, headers: Record<string, string> = {}) =>
  proxy(new NextRequest(new URL(path, 'https://site.test'), { headers }))

describe('proxy', () => {
  it('sends the root to the browser language, never cached for everyone', () => {
    const response = visit('/', { 'accept-language': 'fr-FR,fr;q=0.9' })
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://site.test/fr')
    expect(response.headers.get('vary')).toBe('Accept-Language, Cookie')
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })

  it('falls back to English, keeps the path and the query', () => {
    const response = visit('/nexcan?x=1', { 'accept-language': 'de' })
    expect(response.headers.get('location')).toBe('https://site.test/en/nexcan?x=1')
  })

  it('follows the remembered choice', () => {
    const response = visit('/', {
      'accept-language': 'en',
      cookie: 'locale=fr',
    })
    expect(response.headers.get('location')).toBe('https://site.test/fr')
  })

  it('lets a path that already has its language through', () => {
    expect(visit('/fr/nexcan', { 'accept-language': 'en' }).headers.get('location')).toBeNull()
  })

  it('never runs on the admin, the APIs, OAuth or files', () => {
    // Compiled the way Next compiles it at build time, not re-derived by hand.
    const [compiled] = getMiddlewareMatchers(config.matcher, { i18n: null, basePath: '' })
    const matches = (path: string) => new RegExp(compiled!.regexp).test(path)
    for (const path of [
      '/admin',
      '/admin/login',
      '/api/mcp',
      '/oauth/token',
      '/.well-known/x',
      '/_next/a.js',
      '/favicon.ico',
    ]) {
      expect(matches(path), path).toBe(false)
    }
    // Whole segments only: a page whose slug starts like a reserved path is still routed.
    for (const path of ['/', '/nexcan', '/fr', '/api-design', '/administration', '/oauthx']) {
      expect(matches(path), path).toBe(true)
    }
  })
})
