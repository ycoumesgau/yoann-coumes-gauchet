import { alternateLanguages, pagePath } from './locale-routing'
import type { Locale } from './locales'

/**
 * What search engines, AI crawlers and link previews read. Pure: the page
 * metadata, `robots.txt`, `sitemap.xml` and the SEO plugin's generate buttons
 * call it; the tests pin it.
 */

/** The longest description a result page shows before cutting it. */
export const DESCRIPTION_MAX = 160

/** `home` keeps the site's name alone; any other page says which page it is. */
export const defaultMetaTitle = (pageTitle: string, siteName: string, slug: string): string =>
  slug === 'home' ? siteName : `${pageTitle} · ${siteName}`

/** A text cut at a word under `max` characters, with an ellipsis when cut. */
export const excerpt = (text: string, max = DESCRIPTION_MAX): string => {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–—-]+$/, '')}…`
}

type HeroLike = {
  readonly blockType: string
  readonly headline?: string | null
  readonly subhead?: string | null
  readonly image?: unknown
}

const heroOf = (layout: readonly unknown[] | null | undefined): HeroLike | undefined =>
  (layout ?? []).find(
    (block): block is HeroLike =>
      typeof block === 'object' && block !== null && (block as HeroLike).blockType === 'hero',
  )

/** The page's own words when no description was written: its hero's lead, else its headline. */
export const defaultMetaDescription = (
  layout: readonly unknown[] | null | undefined,
): string | undefined => {
  const hero = heroOf(layout)
  const text = hero?.subhead?.trim() || hero?.headline?.trim()
  return text ? excerpt(text) : undefined
}

/** The hero's image, id or populated document, when no share image was chosen. */
export const defaultMetaImage = (layout: readonly unknown[] | null | undefined): unknown =>
  heroOf(layout)?.image ?? undefined

export type ShareImage = {
  readonly url: string
  readonly width?: number
  readonly height?: number
  readonly alt?: string
}

/** A populated media document as a share image; a film, a `.riv` or an id alone gives none. */
export const shareImage = (media: unknown): ShareImage | undefined => {
  if (typeof media !== 'object' || media === null) return undefined
  const doc = media as {
    url?: unknown
    mimeType?: unknown
    width?: unknown
    height?: unknown
    alt?: unknown
  }
  if (typeof doc.url !== 'string' || typeof doc.mimeType !== 'string') return undefined
  if (!doc.mimeType.startsWith('image/') || doc.mimeType === 'image/svg+xml') return undefined
  return {
    url: doc.url,
    ...(typeof doc.width === 'number' ? { width: doc.width } : {}),
    ...(typeof doc.height === 'number' ? { height: doc.height } : {}),
    ...(typeof doc.alt === 'string' && doc.alt ? { alt: doc.alt } : {}),
  }
}

/** The share image of a page with none of its own: Yoann's portrait, served from `public/`. */
export const DEFAULT_SHARE_IMAGE: ShareImage = { url: '/photo-ycg.jpg', width: 800, height: 800 }

/**
 * What a page says about itself to search engines and link previews: the
 * editor's SEO fields first, the page's own content when one is empty.
 */
export const resolveMeta = (input: {
  readonly slug: string
  readonly pageTitle: string
  readonly siteName: string
  readonly meta?:
    | {
        readonly title?: string | null | undefined
        readonly description?: string | null | undefined
        readonly image?: unknown
      }
    | null
    | undefined
  readonly layout?: readonly unknown[] | null | undefined
}): { title: string; description?: string; image: ShareImage } => {
  const description = input.meta?.description || defaultMetaDescription(input.layout)
  return {
    title: input.meta?.title || defaultMetaTitle(input.pageTitle, input.siteName, input.slug),
    ...(description ? { description } : {}),
    image:
      shareImage(input.meta?.image) ??
      shareImage(defaultMetaImage(input.layout)) ??
      DEFAULT_SHARE_IMAGE,
  }
}

/** Open Graph wants a territory; the site's two languages, as read in France and the US. */
export const openGraphLocale: Readonly<Record<Locale, string>> = { en: 'en_US', fr: 'fr_FR' }

/**
 * `robots.txt`: every crawler, search engines and AI crawlers alike, reads the
 * pages and the media they show; the admin, the APIs and OAuth stay out.
 */
export const robotsRules = (origin: URL | undefined) => ({
  rules: [
    {
      userAgent: '*',
      allow: ['/', '/api/media/file/'],
      disallow: ['/admin', '/api/', '/oauth'],
    },
  ],
  ...(origin ? { sitemap: new URL('/sitemap.xml', origin).href } : {}),
})

export type SitemapEntry = {
  url: string
  lastModified?: string
  alternates: { languages: Record<string, string> }
}

/**
 * `sitemap.xml`: one entry per page and published language, each with its
 * `hreflang` alternates. Nothing without a public origin: a sitemap needs
 * absolute URLs.
 */
export const sitemapEntries = (
  origin: URL | undefined,
  pages: readonly {
    readonly slug: string
    readonly published: readonly Locale[]
    readonly updatedAt?: string
  }[],
): SitemapEntry[] => {
  if (!origin) return []
  const absolute = (path: string) => new URL(path, origin).href
  return pages.flatMap((page) =>
    page.published.map((locale) => ({
      url: absolute(pagePath(locale, page.slug)),
      ...(page.updatedAt ? { lastModified: page.updatedAt } : {}),
      alternates: {
        languages: Object.fromEntries(
          Object.entries(alternateLanguages(page.slug, page.published)).map(([lang, path]) => [
            lang,
            absolute(path),
          ]),
        ),
      },
    })),
  )
}

/**
 * The home page's structured data: who the site is about, and the profiles
 * that are his (the footer's web links). Nothing else is claimed.
 */
export const personJsonLd = (input: {
  readonly name: string
  readonly url: string
  readonly links: readonly { readonly url: string }[]
}) => {
  const sameAs = input.links.map((link) => link.url).filter((url) => /^https:\/\//i.test(url))
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    url: input.url,
    ...(sameAs.length ? { sameAs } : {}),
  }
}

/** JSON for a `<script>` element: a `<` in the content can never close it. */
export const jsonLdScript = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c')
