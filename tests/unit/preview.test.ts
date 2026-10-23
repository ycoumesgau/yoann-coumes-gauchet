import { describe, expect, it } from 'vitest'

import nextConfig from '../../next.config'
import { isAdminUser } from '@/domain/access'
import { previewFrameSource, previewHref, previewPath, previewUrl } from '@/domain/preview'
import { validateSlug } from '@/domain/slug'

describe('live preview', () => {
  it('frames a page under its language', () => {
    expect(previewPath('fr', 'nexcan')).toBe('/fr/preview/nexcan')
    // A path: the admin makes it absolute on the origin the browser is on (https).
    expect(previewUrl({ locale: 'en', slug: 'home' })).toBe('/en/preview/home')
  })

  it('shows no preview without a slug or with a language the site does not have', () => {
    expect(previewUrl({ locale: 'en', slug: undefined })).toBeNull()
    expect(previewUrl({ locale: 'en', slug: '' })).toBeNull()
    expect(previewUrl({ locale: 'de', slug: 'home' })).toBeNull()
    expect(previewUrl({ locale: undefined, slug: 'home' })).toBeNull()
  })

  it('keeps a click on a page of the site inside the preview', () => {
    expect(previewHref('/en')).toBe('/en/preview/home')
    expect(previewHref('/fr/nexcan')).toBe('/fr/preview/nexcan')
    expect(previewHref('/fr/preview/nexcan')).toBeNull()
    expect(previewHref('/api/media/file/cv.pdf')).toBeNull()
    expect(previewHref('/en/a/b')).toBeNull()
    expect(previewHref('/')).toBeNull()
  })

  it('reserves its segment: no page may be called `preview`', () => {
    expect(validateSlug('preview')).not.toBe(true)
    expect(validateSlug('previews')).toBe(true)
  })

  it('opens only to an administrator', () => {
    expect(isAdminUser(null)).toBe(false)
    expect(isAdminUser(undefined)).toBe(false)
    expect(isAdminUser({ id: 1, collection: 'api-keys' } as never)).toBe(false)
    expect(isAdminUser({ id: 1, collection: 'users' } as never)).toBe(true)
  })

  it('lets this origin alone frame the preview, after the rule that forbids framing', async () => {
    const rules = (await nextConfig.headers?.()) ?? []
    const all = rules.findIndex((rule) => rule.source === '/:path*')
    const preview = rules.findIndex((rule) => rule.source === previewFrameSource)
    expect(previewFrameSource).toBe('/:locale(en|fr)/preview/:slug')
    expect(preview).toBeGreaterThan(all)
    expect(rules[preview]?.headers).toEqual([
      { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    ])
  })
})
