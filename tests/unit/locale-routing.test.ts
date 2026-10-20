import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import {
  localeOfPath,
  negotiateLocale,
  pagePath,
  parseAcceptLanguage,
  switchLocaleOfPath,
} from '@/domain/locale-routing'
import { config, proxy } from '@/proxy'

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
  })
})

describe('paths', () => {
  it('serves home at the language root', () => {
    expect(pagePath('fr', 'home')).toBe('/fr')
    expect(pagePath('en', 'nexcan')).toBe('/en/nexcan')
  })

  it('switches the language of a path and nothing else', () => {
    expect(switchLocaleOfPath('/en/nexcan', 'fr')).toBe('/fr/nexcan')
    expect(switchLocaleOfPath('/fr', 'en')).toBe('/en')
    expect(switchLocaleOfPath('/english', 'fr')).toBe('/fr')
    expect(localeOfPath('/english')).toBeNull()
  })
})

const visit = (path: string, headers: Record<string, string> = {}) =>
  proxy(new NextRequest(new URL(path, 'https://site.test'), { headers }))

describe('proxy', () => {
  it('sends the root to the browser language, never cached for everyone', () => {
    const response = visit('/', { 'accept-language': 'fr-FR,fr;q=0.9' })
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://site.test/fr')
    expect(response.headers.get('vary')).toContain('Accept-Language')
    expect(response.headers.get('cache-control')).toContain('private')
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
    const [source] = config.matcher
    const matches = (path: string) => new RegExp(`^${source}$`).test(path)
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
    for (const path of ['/', '/nexcan', '/fr']) expect(matches(path), path).toBe(true)
  })
})
