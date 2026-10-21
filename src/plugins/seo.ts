import { seoPlugin } from '@payloadcms/plugin-seo'
import type { Plugin } from 'payload'

import { pagePath } from '@/domain/locale-routing'
import { defaultLocale, isLocale } from '@/domain/locales'
import { parsePublicUrl } from '@/domain/mcp-oauth/config'
import { defaultMetaDescription, defaultMetaImage, defaultMetaTitle } from '@/domain/seo'

/**
 * The SEO fields of `pages` (`meta`: title, description, share image, each per
 * language), from `@payloadcms/plugin-seo`. Its "generate" buttons in /admin
 * fill a field with what the public page shows when the field is left empty
 * (`pageMetadata`), so an editor sees the fallback before overriding it.
 */
export const seo = (): Plugin =>
  seoPlugin({
    collections: ['pages'],
    uploadsCollection: 'media',
    generateTitle: async ({ doc, req }) => {
      const site = await req.payload.findGlobal({
        slug: 'site',
        depth: 0,
        req,
        user: req.user,
        overrideAccess: false,
      })
      return defaultMetaTitle(doc?.title ?? '', site.name, doc?.slug ?? '')
    },
    generateDescription: ({ doc }) => defaultMetaDescription(doc?.layout) ?? '',
    generateImage: ({ doc }) => {
      const image = defaultMetaImage(doc?.layout)
      if (typeof image === 'number' || typeof image === 'string') return image
      if (image && typeof image === 'object' && 'id' in image) return image as { id: number }
      return ''
    },
    generateURL: ({ doc, locale }) => {
      const origin = process.env.SITE_URL ? parsePublicUrl(process.env.SITE_URL.trim()) : null
      const path = pagePath(locale && isLocale(locale) ? locale : defaultLocale, doc?.slug ?? '')
      return origin ? new URL(path, origin).href : path
    },
  })
