import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

import { spotifyEmbedUrl, videoEmbedUrl, type VideoPlatform } from '@/domain/embeds'
import { pagePath } from '@/domain/locale-routing'
import type { Locale } from '@/domain/locales'
import type { Media, Page, Project } from '@/payload-types'

import { Embed } from './embed'

/**
 * Each block of a page as plain, semantic HTML. Structure only: the visual
 * pass replaces the markup's look, not what it says. Text comes from Payload;
 * a relation the visitor may not read (unpublished, trashed) arrives as a bare
 * id and is left out.
 */

export type PageBlock = NonNullable<Page['layout']>[number]

const providerNames: Record<VideoPlatform, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
}

type ReadableImage = Media & { url: string; alt: string; width: number; height: number }

/**
 * An image the visitor may see, with its text alternative in this language
 * (`alt` is localized and the site reads without fallback). Anything else, an
 * unreadable relation, a video, a PDF, is left out.
 */
export const readableImage = (value: number | Media | null | undefined): ReadableImage | null =>
  typeof value === 'object' &&
  value !== null &&
  value.url &&
  value.alt &&
  value.width &&
  value.height &&
  value.mimeType?.startsWith('image/')
    ? (value as ReadableImage)
    : null

/** An image from the media library, served by Payload (`/api/media/file/…`) and resized by Next. */
function MediaImage({ media, sizes }: { media: ReadableImage; sizes: string }) {
  return (
    <Image
      src={media.url}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
    />
  )
}

/** The page's `<h1>`: the hero's headline when the page opens on a hero, else its title. */
export const opensOnHero = (layout: Page['layout']): boolean => layout?.[0]?.blockType === 'hero'

export function PageTitle({ page }: { page: Pick<Page, 'title' | 'layout'> }) {
  return opensOnHero(page.layout) ? null : <h1>{page.title}</h1>
}

export function RenderBlocks({ blocks, locale }: { blocks: readonly PageBlock[]; locale: Locale }) {
  return blocks.map((block, index) => {
    const key = block.id ?? `${block.blockType}-${index}`
    switch (block.blockType) {
      case 'hero':
        return (
          <header key={key} className="block-hero">
            {index === 0 ? <h1>{block.headline}</h1> : <h2>{block.headline}</h2>}
            {block.subhead ? <p>{block.subhead}</p> : null}
            {block.demo ? <figure className="block-demo" data-demo={block.demo} /> : null}
          </header>
        )
      case 'section':
        return (
          <section key={key} className="block-section">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <RichText data={block.body} />
          </section>
        )
      case 'projectCards': {
        // Unpublished or trashed projects arrive as an id (or null for a reader of the trash).
        const projects = block.projects.filter(
          (project): project is Project => typeof project === 'object' && project !== null,
        )
        if (projects.length === 0) return null
        const CardTitle = block.heading ? 'h3' : 'h2'
        return (
          <section key={key} className="block-projects">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <ul>
              {projects.map((project) => {
                const image = readableImage(project.image)
                const page = typeof project.page === 'object' ? project.page : null
                return (
                  <li key={project.id}>
                    <article>
                      {image ? (
                        <MediaImage media={image} sizes="(max-width: 600px) 100vw, 33vw" />
                      ) : null}
                      <CardTitle>
                        {page ? (
                          <a href={pagePath(locale, page.slug)}>{project.name}</a>
                        ) : (
                          project.name
                        )}
                      </CardTitle>
                      <p>{project.tagline}</p>
                      <p>{project.period}</p>
                      <p>{project.summary}</p>
                    </article>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      }
      case 'timeline': {
        const EntryTitle = block.heading ? 'h3' : 'h2'
        return (
          <section key={key} className="block-timeline">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <ol>
              {block.entries.map((entry, i) => (
                <li key={entry.id ?? i}>
                  <p>{entry.period}</p>
                  <EntryTitle>{entry.title}</EntryTitle>
                  {entry.body ? <p>{entry.body}</p> : null}
                </li>
              ))}
            </ol>
          </section>
        )
      }
      case 'videoCarousel':
        return (
          <section key={key} className="block-videos">
            {block.heading ? <h2>{block.heading}</h2> : null}
            {block.intro ? <p>{block.intro}</p> : null}
            <ul>
              {block.videos.map((video, i) => (
                <li key={video.id ?? i}>
                  <Embed
                    src={videoEmbedUrl(video.platform, video.videoId)}
                    title={`${video.title} · ${providerNames[video.platform]}`}
                    aspect="vertical"
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      case 'spotify': {
        const src = spotifyEmbedUrl(block.ref)
        return src ? (
          <section key={key} className="block-spotify">
            {block.heading ? <h2>{block.heading}</h2> : null}
            {block.intro ? <p>{block.intro}</p> : null}
            <Embed
              src={src}
              title={block.heading ? `${block.heading} · Spotify` : 'Spotify'}
              aspect="player"
            />
          </section>
        ) : null
      }
      case 'rive': {
        // The Rive player comes with the demos (L4); until then, the still image.
        const fallback = readableImage(block.fallback)
        return fallback ? (
          <figure key={key} className="block-rive">
            <MediaImage media={fallback} sizes="(max-width: 600px) 100vw, 50vw" />
            {block.caption ? <figcaption>{block.caption}</figcaption> : null}
          </figure>
        ) : null
      }
      case 'demo':
        // Each demo is its own component (L4); the block carries its caption and source.
        return (
          <figure key={key} className="block-demo" data-demo={block.demo}>
            {block.caption || block.source ? (
              <figcaption>
                {block.caption}
                {block.source ? <small> {block.source}</small> : null}
              </figcaption>
            ) : null}
          </figure>
        )
      default:
        return null
    }
  })
}
