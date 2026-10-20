import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

import { spotifyEmbedUrl, videoEmbedUrl, type VideoPlatform } from '@/domain/embeds'
import { pagePath } from '@/domain/locale-routing'
import type { Locale } from '@/domain/locales'
import type { Media, Page } from '@/payload-types'

import { EmbedFacade } from './embed-facade'

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

const readableMedia = (value: number | Media | null | undefined): Media | null =>
  typeof value === 'object' && value?.url ? value : null

/** An image from the media library, served by Payload (`/api/media/file/…`) and resized by Next. */
function MediaImage({ media, sizes }: { media: Media; sizes: string }) {
  return (
    <Image
      src={media.url!}
      alt={media.alt}
      width={media.width ?? 1200}
      height={media.height ?? 1200}
      sizes={sizes}
    />
  )
}

/** The page's `<h1>`: the hero's headline when the page opens on a hero, else its title. */
export const opensOnHero = (layout: Page['layout']): boolean => layout?.[0]?.blockType === 'hero'

export function RenderBlocks({
  blocks,
  locale,
  notice,
}: {
  blocks: readonly PageBlock[]
  locale: Locale
  notice: string | null
}) {
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
      case 'projectCards':
        return (
          <section key={key} className="block-projects">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <ul>
              {block.projects.map((project) => {
                if (typeof project !== 'object') return null
                const image = readableMedia(project.image)
                const page = typeof project.page === 'object' ? project.page : null
                return (
                  <li key={project.id}>
                    <article>
                      {image ? (
                        <MediaImage media={image} sizes="(max-width: 600px) 100vw, 33vw" />
                      ) : null}
                      <h3>
                        {page ? (
                          <a href={pagePath(locale, page.slug)}>{project.name}</a>
                        ) : (
                          project.name
                        )}
                      </h3>
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
      case 'timeline':
        return (
          <section key={key} className="block-timeline">
            {block.heading ? <h2>{block.heading}</h2> : null}
            <ol>
              {block.entries.map((entry, i) => (
                <li key={entry.id ?? i}>
                  <p>{entry.period}</p>
                  <h3>{entry.title}</h3>
                  {entry.body ? <p>{entry.body}</p> : null}
                </li>
              ))}
            </ol>
          </section>
        )
      case 'videoCarousel':
        return (
          <section key={key} className="block-videos">
            {block.heading ? <h2>{block.heading}</h2> : null}
            {block.intro ? <p>{block.intro}</p> : null}
            <ul>
              {block.videos.map((video, i) => {
                const poster = readableMedia(video.poster)
                return (
                  <li key={video.id ?? i}>
                    <EmbedFacade
                      src={videoEmbedUrl(video.platform, video.videoId)}
                      title={video.title}
                      provider={providerNames[video.platform]}
                      notice={notice}
                      aspect="vertical"
                      poster={
                        poster ? (
                          <MediaImage media={poster} sizes="(max-width: 600px) 100vw, 25vw" />
                        ) : null
                      }
                    />
                  </li>
                )
              })}
            </ul>
          </section>
        )
      case 'spotify': {
        const src = spotifyEmbedUrl(block.ref)
        return src ? (
          <section key={key} className="block-spotify">
            {block.heading ? <h2>{block.heading}</h2> : null}
            {block.intro ? <p>{block.intro}</p> : null}
            <EmbedFacade
              src={src}
              title={block.heading ?? 'Spotify'}
              provider="Spotify"
              notice={notice}
              aspect="player"
            />
          </section>
        ) : null
      }
      case 'rive': {
        // The Rive player comes with the demos (L4); until then, the still image.
        const fallback = readableMedia(block.fallback)
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
