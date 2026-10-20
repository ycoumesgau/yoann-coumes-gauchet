import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import type React from 'react'

import { isDemoKey } from '@/domain/demos'
import { spotifyEmbedUrl, videoEmbedUrl, type VideoPlatform } from '@/domain/embeds'
import { pagePath } from '@/domain/locale-routing'
import type { Locale } from '@/domain/locales'
import type { Media, Page, Project, Site } from '@/payload-types'

import { Film, type FilmTexts } from '../_films/film'
import { Embed } from './embed'
import { Screens, type Screen } from './screens'
import { Shorts } from './shorts'

/**
 * Each block of a page as semantic HTML in the site's look (identity 1a). Text
 * comes from Payload; a relation the visitor may not read (unpublished,
 * trashed) arrives as a bare id and is left out.
 */

export type PageBlock = NonNullable<Page['layout']>[number]
export type FrameLabels = NonNullable<Site['labels']>

/** The words of every film in this language, grouped by film. */
export const filmTextsByFilm = (
  entries: Site['filmTexts'],
): Readonly<Partial<Record<string, FilmTexts>>> => {
  const byFilm: Record<string, Record<string, string>> = {}
  for (const entry of entries ?? []) {
    if (!entry.text) continue
    ;(byFilm[entry.film] ??= {})[entry.key] = entry.text
  }
  return byFilm
}

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

/** A file the visitor may download (the CV): readable, with a URL. */
const readableFile = (
  value: number | Media | null | undefined,
): (Media & { url: string }) | null =>
  typeof value === 'object' && value !== null && value.url
    ? (value as Media & { url: string })
    : null

/** An image from the media library, served by Payload (`/api/media/file/…`) and resized by Next. */
function MediaImage({
  media,
  sizes,
  priority,
}: {
  media: ReadableImage
  sizes: string
  priority?: boolean
}) {
  return (
    <Image
      src={media.url}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      priority={priority ?? false}
    />
  )
}

type Link = {
  label?: string | null
  page?: number | Page | null
  url?: string | null
}

/**
 * Where a link goes: a page of this site in the reader's language, or a full
 * URL. A page the reader may not see (a bare id) and an empty link go nowhere.
 */
export const linkHref = (locale: Locale, link: Link | null | undefined): string | null => {
  if (!link) return null
  if (typeof link.page === 'object' && link.page?.slug) return pagePath(locale, link.page.slug)
  if (link.url && /^(https?:\/\/|mailto:)/i.test(link.url)) return link.url
  return null
}

const isWeb = (href: string) => /^https?:\/\//i.test(href)

function ArrowLink({
  locale,
  link,
  className = 'more',
}: {
  locale: Locale
  link: Link | null | undefined
  className?: string
}) {
  const href = linkHref(locale, link)
  if (!href || !link?.label) return null
  return (
    <a
      className={className}
      href={href}
      target={isWeb(href) ? '_blank' : undefined}
      rel={isWeb(href) ? 'noopener' : undefined}
    >
      {isWeb(href) ? `↗ ${link.label}` : `→ ${link.label}`}
    </a>
  )
}

function Heading({ text, mark = true }: { text?: string | null | undefined; mark?: boolean }) {
  if (!text) return null
  return (
    <h2 className="h2">
      {mark ? <span className="h-mark" aria-hidden="true" /> : null}
      {text}
    </h2>
  )
}

const screenOf = (
  value: number | Media | null | undefined,
  caption?: string | null,
  tag?: string | null,
): Screen | null => {
  const image = readableImage(value)
  return image
    ? {
        src: image.url,
        alt: image.alt,
        width: image.width,
        height: image.height,
        caption: caption ?? null,
        tag: tag ?? null,
      }
    : null
}

/** The page's `<h1>`: the hero's headline when the page opens on a hero, else its title. */
export const opensOnHero = (layout: Page['layout']): boolean => layout?.[0]?.blockType === 'hero'

export function PageTitle({ page }: { page: Pick<Page, 'title' | 'layout'> }) {
  return opensOnHero(page.layout) ? null : (
    <header className="block hero">
      <h1 className="h1">{page.title}</h1>
    </header>
  )
}

/**
 * A numbered section opens a step (the method); the blocks after it sit in its
 * column until the next section with a heading, or the end of the steps.
 */
export const stepFlags = (blocks: readonly PageBlock[]): ('step' | 'in-step' | null)[] => {
  let open = false
  return blocks.map((block) => {
    if (block.blockType === 'section' && block.number) {
      open = true
      return 'step'
    }
    if (!open) return null
    const closes =
      block.blockType === 'hero' ||
      block.blockType === 'nextLinks' ||
      (block.blockType === 'section' && Boolean(block.heading))
    if (closes) {
      open = false
      return null
    }
    return 'in-step'
  })
}

export function RenderBlocks({
  blocks,
  locale,
  labels = {},
  filmTexts = [],
}: {
  blocks: readonly PageBlock[]
  locale: Locale
  labels?: FrameLabels | null | undefined
  filmTexts?: Site['filmTexts']
}) {
  const texts = filmTextsByFilm(filmTexts)
  const flags = stepFlags(blocks)
  const frame = labels ?? {}
  return blocks.map((block, index) => {
    const key = block.id ?? `${block.blockType}-${index}`
    const flag = flags[index]
    const content = renderBlock(block, index, locale, frame, texts)
    if (content === null) return null
    if (flag === 'in-step') {
      return (
        <div key={key} className="block in-step">
          <div className="in-step-body">{content.inner}</div>
        </div>
      )
    }
    return (
      <content.Tag
        key={key}
        className={['block', content.className, flag].filter(Boolean).join(' ')}
      >
        {content.inner}
      </content.Tag>
    )
  })
}

type Rendered = {
  Tag: 'section' | 'header' | 'nav' | 'figure'
  className?: string
  inner: React.ReactNode
}

function renderBlock(
  block: PageBlock,
  index: number,
  locale: Locale,
  labels: FrameLabels,
  texts: Readonly<Partial<Record<string, FilmTexts>>>,
): Rendered | null {
  switch (block.blockType) {
    case 'hero': {
      const image = readableImage(block.image)
      const badge = readableImage(block.badge)
      const Title = index === 0 ? 'h1' : 'h2'
      const text = (
        <div>
          {block.eyebrow || block.status ? (
            <p className="eyebrow">
              {block.eyebrow ? <span>{block.eyebrow}</span> : null}
              {block.status ? (
                <span className="status" data-tone="live">
                  {block.status}
                </span>
              ) : null}
            </p>
          ) : null}
          <Title className="h1">{block.headline}</Title>
          {block.subhead ? <p className="lead">{block.subhead}</p> : null}
        </div>
      )
      return {
        Tag: 'header',
        className: 'hero',
        inner: (
          <>
            {image ? (
              <div className="hero-grid">
                {text}
                <div className={badge ? 'hero-photo' : 'hero-photo plain'}>
                  <MediaImage media={image} sizes="(max-width: 1023px) 340px, 520px" priority />
                  {badge ? (
                    <div className="hero-badge">
                      <MediaImage media={badge} sizes="112px" />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              text
            )}
            {isDemoKey(block.demo) ? (
              <div className="hero-film">
                <Film demo={block.demo} labels={labels} texts={texts[block.demo] ?? {}} />
              </div>
            ) : null}
          </>
        ),
      }
    }
    case 'section': {
      const screen = screenOf(block.image, block.imageCaption, block.tag)
      const step = Boolean(block.number)
      const body = (
        <div>
          {step ? (
            block.heading ? (
              <h2 className="h2">{block.heading}</h2>
            ) : null
          ) : (
            <Heading text={block.heading} />
          )}
          <div className="rich">
            <RichText data={block.body} />
          </div>
          <ArrowLink locale={locale} link={block.link} />
          {block.details && block.detailsLabel ? (
            <details className="details">
              <summary>{block.detailsLabel}</summary>
              <div className="rich">
                <RichText data={block.details} />
              </div>
            </details>
          ) : null}
        </div>
      )
      const withMedia = screen ? (
        <div className={`section-grid ${block.imageSide === 'left' ? 'left' : ''}`}>
          {body}
          <div className="section-media">
            <Screens screens={[screen]} labels={labels} />
          </div>
        </div>
      ) : (
        body
      )
      const film = isDemoKey(block.demo) ? (
        <div className="section-film">
          <Film demo={block.demo} labels={labels} texts={texts[block.demo] ?? {}} />
          {block.demoCaption ? <p className="film-caption">{block.demoCaption}</p> : null}
        </div>
      ) : null
      return {
        Tag: 'section',
        inner: step ? (
          <div className="step-row">
            <span className="step-number">{block.number}</span>
            <div>
              {withMedia}
              {film}
            </div>
          </div>
        ) : (
          <>
            {withMedia}
            {film}
          </>
        ),
      }
    }
    case 'features':
      return {
        Tag: 'section',
        inner: (
          <>
            <Heading text={block.heading} />
            <ul className="features">
              {block.items.map((item, i) => {
                const image = readableImage(item.image)
                const phone = image ? image.height > image.width : false
                return (
                  <li key={item.id ?? i} className="feature">
                    {image || isDemoKey(item.demo) ? (
                      <div className={phone ? 'thumb phone' : 'thumb'}>
                        {isDemoKey(item.demo) ? (
                          <Film
                            demo={item.demo}
                            labels={labels}
                            texts={texts[item.demo] ?? {}}
                            still
                          />
                        ) : image ? (
                          <MediaImage media={image} sizes="(max-width: 700px) 100vw, 33vw" />
                        ) : null}
                        {item.tag ? <span className="tag">{item.tag}</span> : null}
                      </div>
                    ) : null}
                    <p className="text">
                      {item.lead ? <strong>{item.lead} </strong> : null}
                      {item.body}
                    </p>
                    <ArrowLink locale={locale} link={item.link} />
                  </li>
                )
              })}
            </ul>
          </>
        ),
      }
    case 'workRows':
      return {
        Tag: 'section',
        inner: (
          <>
            <Heading text={block.heading} />
            <ul className="work">
              {block.rows.map((row, i) => {
                const screen = screenOf(row.image, row.imageCaption, row.tag)
                return (
                  <li key={row.id ?? i} className="work-row">
                    <div className="stack">
                      {row.status ? (
                        <div>
                          <span className="status" data-tone={row.tone ?? 'past'}>
                            {row.status}
                          </span>
                        </div>
                      ) : null}
                      <h3 className="h3">{row.title}</h3>
                      {row.meta ? <p className="meta">{row.meta}</p> : null}
                      {row.body ? <p className="text">{row.body}</p> : null}
                      <ArrowLink locale={locale} link={row.link} />
                    </div>
                    {screen ? <Screens screens={[screen]} labels={labels} /> : null}
                  </li>
                )
              })}
            </ul>
          </>
        ),
      }
    case 'factList': {
      const cards = block.columns === '4'
      return {
        Tag: 'section',
        inner: (
          <>
            <Heading text={block.heading} />
            {block.intro ? (
              <p className="text" style={{ marginBottom: 24 }}>
                {block.intro}
              </p>
            ) : null}
            <ol className="facts" data-columns={block.columns ?? '2'}>
              {block.items.map((item, i) => (
                <li key={item.id ?? i} className={cards ? 'fact fact-card' : 'fact'}>
                  {block.numbered ? (
                    <span className="fact-number">{String(i + 1).padStart(2, '0')}</span>
                  ) : null}
                  <p className="text">
                    {item.kicker ? <span className="fact-kicker">{item.kicker}</span> : null}
                    {item.lead ? (
                      cards ? (
                        <span className="fact-lead">{item.lead}</span>
                      ) : (
                        <strong>{item.lead} </strong>
                      )
                    ) : null}
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </>
        ),
      }
    }
    case 'stats': {
      const figures = (
        <ul className="stats">
          {block.items.map((item, i) => (
            <li key={item.id ?? i} className="stat">
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </li>
          ))}
        </ul>
      )
      return {
        Tag: 'section',
        inner: (
          <>
            <Heading text={block.heading} />
            {block.body ? (
              <div className="stats-grid">
                {figures}
                <div className="rich">
                  <RichText data={block.body} />
                </div>
              </div>
            ) : (
              figures
            )}
          </>
        ),
      }
    }
    case 'checklist':
      return {
        Tag: 'section',
        inner: (
          <div className="checklist-grid">
            <ul className="checks">
              {block.items.map((item, i) => (
                <li key={item.id ?? i}>{item.text}</li>
              ))}
            </ul>
            {block.note?.title || block.note?.body ? (
              <aside className="note">
                {block.note.kicker ? (
                  <span className="note-kicker">{block.note.kicker}</span>
                ) : null}
                {block.note.title ? <span className="note-title">{block.note.title}</span> : null}
                {block.note.body ? <span className="text">{block.note.body}</span> : null}
              </aside>
            ) : null}
          </div>
        ),
      }
    case 'gallery': {
      const screens = block.items.flatMap((item) => {
        const screen = screenOf(item.image, item.caption, item.tag)
        return screen ? [{ screen, item }] : []
      })
      if (screens.length === 0) return null
      return {
        Tag: 'section',
        inner: (
          <>
            <Heading text={block.heading} />
            {block.source ? <p className="source">{block.source}</p> : null}
            {block.intro ? (
              <p className="text" style={{ marginBottom: 24 }}>
                {block.intro}
              </p>
            ) : null}
            {block.variant === 'wide' ? (
              <div className="gallery-wide">
                {screens.map(({ screen }) => (
                  // eslint-disable-next-line @next/next/no-img-element -- a single wide picture, served by Payload
                  <img
                    key={screen.src}
                    src={screen.src}
                    alt={screen.alt}
                    width={screen.width}
                    height={screen.height}
                    loading="lazy"
                  />
                ))}
              </div>
            ) : block.variant === 'cards' ? (
              <ul className="gallery" data-variant="cards">
                {screens.map(({ screen, item }, i) => (
                  <li key={item.id ?? i}>
                    <figure>
                      <div className="shot">
                        {/* eslint-disable-next-line @next/next/no-img-element -- square card, served by Payload */}
                        <img src={screen.src} alt={screen.alt} loading="lazy" />
                      </div>
                      <div className="card-title">
                        {item.title}
                        {item.badge ? (
                          <span className="status" data-tone="live">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      {item.caption ? <p className="meta">{item.caption}</p> : null}
                    </figure>
                  </li>
                ))}
              </ul>
            ) : (
              <Screens screens={screens.map(({ screen }) => screen)} labels={labels} grid />
            )}
          </>
        ),
      }
    }
    case 'columns':
      return {
        Tag: 'section',
        inner: (
          <div className="columns">
            {block.columns.map((column, i) => (
              <div key={column.id ?? i}>
                {column.status ? (
                  <p className="eyebrow">
                    <span className="status" data-tone="live">
                      {column.status}
                    </span>
                  </p>
                ) : null}
                {column.heading ? <h2 className="h2">{column.heading}</h2> : null}
                <div className="rich">
                  <RichText data={column.body} />
                </div>
              </div>
            ))}
          </div>
        ),
      }
    case 'callout':
      return {
        Tag: 'section',
        inner: (
          <div className="callout" data-tone={block.tone ?? 'plain'}>
            {block.heading ? <Heading text={block.heading} /> : null}
            <div className="callout-body">
              <p className="text">{block.body}</p>
              <ArrowLink locale={locale} link={block.link} />
            </div>
          </div>
        ),
      }
    case 'linkList':
      return {
        Tag: 'section',
        inner: (
          <>
            <Heading text={block.heading} />
            <ul className="links">
              {block.items.map((item, i) => {
                const href = item.url && /^(https?:\/\/|mailto:)/i.test(item.url) ? item.url : null
                const web = href ? isWeb(href) : false
                const contact = !item.period && !item.body
                const inner = contact ? (
                  <>
                    <span>{item.title}</span>
                    <span aria-hidden="true">→</span>
                  </>
                ) : (
                  <>
                    <span className="link-period">{item.period}</span>
                    <span>
                      <span className="link-title">{item.title}</span>
                      {item.body ? <span className="link-body">{item.body}</span> : null}
                    </span>
                    {item.urlLabel ? <span className="link-go">→ {item.urlLabel}</span> : <span />}
                  </>
                )
                const className = contact ? 'contact-row' : 'link-row'
                return (
                  <li key={item.id ?? i}>
                    {href ? (
                      <a
                        className={className}
                        href={href}
                        target={web ? '_blank' : undefined}
                        rel={web ? 'noopener' : undefined}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className={className}>{inner}</div>
                    )}
                  </li>
                )
              })}
            </ul>
            {block.files?.items?.length ? (
              <p className="files">
                {block.files.label ? <span>{block.files.label}</span> : null}
                {block.files.items.map((file, i) => {
                  const media = readableFile(file.file)
                  return media ? (
                    <a key={file.id ?? i} href={media.url} lang={file.lang ?? undefined} download>
                      {file.label}
                    </a>
                  ) : (
                    <span key={file.id ?? i} lang={file.lang ?? undefined} className="meta">
                      {file.label}
                    </span>
                  )
                })}
              </p>
            ) : null}
          </>
        ),
      }
    case 'nextLinks': {
      const links = block.links.flatMap((entry) => {
        const href = linkHref(locale, entry.link)
        return href && entry.link?.label ? [{ entry, href }] : []
      })
      if (links.length === 0 && !block.note) return null
      return {
        Tag: 'nav',
        className: 'tight',
        inner: (
          <>
            <div className="next">
              {links.map(({ entry, href }, i) => (
                <a
                  key={entry.id ?? i}
                  href={href}
                  target={isWeb(href) ? '_blank' : undefined}
                  rel={isWeb(href) ? 'noopener' : undefined}
                >
                  <span>
                    {entry.kicker ? <span className="next-kicker">{entry.kicker}</span> : null}
                    <span className="next-label">{entry.link?.label}</span>
                  </span>
                  <span aria-hidden="true">{isWeb(href) ? '↗' : '→'}</span>
                </a>
              ))}
            </div>
            {block.note ? <p className="next-note">{block.note}</p> : null}
          </>
        ),
      }
    }
    case 'projectCards': {
      // Unpublished or trashed projects arrive as an id (or null for a reader of the trash).
      const projects = block.projects.filter(
        (project): project is Project => typeof project === 'object' && project !== null,
      )
      if (projects.length === 0) return null
      const CardTitle = block.heading ? 'h3' : 'h2'
      return {
        Tag: 'section',
        inner: (
          <>
            <Heading text={block.heading} />
            <ul className="work">
              {projects.map((project) => {
                const image = readableImage(project.image)
                const page = typeof project.page === 'object' ? project.page : null
                return (
                  <li key={project.id} className="work-row">
                    <div className="stack">
                      <CardTitle className="h3">
                        {page ? (
                          <a href={pagePath(locale, page.slug)}>{project.name}</a>
                        ) : (
                          project.name
                        )}
                      </CardTitle>
                      <p className="meta">
                        {project.tagline} · {project.period}
                      </p>
                      <p className="text">{project.summary}</p>
                    </div>
                    {image ? (
                      <MediaImage media={image} sizes="(max-width: 700px) 100vw, 50vw" />
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </>
        ),
      }
    }
    case 'timeline': {
      const EntryTitle = block.heading ? 'h3' : 'h2'
      return {
        Tag: 'section',
        inner: (
          <>
            <Heading text={block.heading} />
            <ol className="timeline">
              {block.entries.map((entry, i) => {
                const page = typeof entry.page === 'object' && entry.page ? entry.page : null
                const inner = (
                  <>
                    <span className="link-period">{entry.period}</span>
                    <EntryTitle className="t-title">{entry.title}</EntryTitle>
                    {page && block.linkLabel ? (
                      <span className="link-go">→ {block.linkLabel}</span>
                    ) : (
                      <span />
                    )}
                    {entry.body ? <span className="t-body">{entry.body}</span> : null}
                  </>
                )
                return (
                  <li key={entry.id ?? i}>
                    {page ? <a href={pagePath(locale, page.slug)}>{inner}</a> : <div>{inner}</div>}
                  </li>
                )
              })}
            </ol>
          </>
        ),
      }
    }
    case 'videoCarousel': {
      const videos = block.videos.flatMap((video) => {
        const src = videoEmbedUrl(video.platform, video.videoId)
        return src
          ? [
              {
                src,
                platform: video.platform,
                videoId: video.videoId,
                title: `${video.title} · ${providerNames[video.platform]}`,
                label: video.title,
              },
            ]
          : []
      })
      if (videos.length === 0) return null
      return {
        Tag: 'section',
        inner: (
          <>
            <Heading text={block.heading} />
            {block.intro ? (
              <p className="text" style={{ marginBottom: 24 }}>
                {block.intro}
              </p>
            ) : null}
            <Shorts
              videos={videos}
              labels={{
                previous: block.labels?.previous ?? labels.previous ?? '',
                next: block.labels?.next ?? labels.next ?? '',
                autoplay: block.labels?.autoplay ?? '',
              }}
              links={(block.links ?? []).filter((link) => isWeb(link.url))}
            />
          </>
        ),
      }
    }
    case 'spotify': {
      const src = spotifyEmbedUrl(block.ref)
      if (!src) return null
      const [kind, id] = block.ref.split(':')
      return {
        Tag: 'section',
        className: 'tight',
        inner: (
          <>
            <Heading text={block.heading} />
            {block.intro ? (
              <p className="text" style={{ marginBottom: 24 }}>
                {block.intro}
              </p>
            ) : null}
            <Embed
              src={src}
              title={block.heading ? `${block.heading} · Spotify` : 'Spotify'}
              aspect="player"
            />
            {block.linkLabel ? (
              <p className="channel-links">
                <a href={`https://open.spotify.com/${kind}/${id}`} target="_blank" rel="noopener">
                  → {block.linkLabel}
                </a>
              </p>
            ) : null}
          </>
        ),
      }
    }
    case 'rive': {
      const fallback = readableImage(block.fallback)
      if (!fallback && !block.heading) return null
      return {
        Tag: 'section',
        inner: (
          <div className="rive-grid">
            <div>
              <Heading text={block.heading} />
              {block.body ? <p className="text">{block.body}</p> : null}
            </div>
            {fallback ? (
              <figure className="rive-stage" style={{ margin: 0 }}>
                <MediaImage media={fallback} sizes="420px" />
                {block.caption ? (
                  <figcaption className="visually-hidden">{block.caption}</figcaption>
                ) : null}
              </figure>
            ) : null}
          </div>
        ),
      }
    }
    case 'demo':
      if (!isDemoKey(block.demo)) return null
      return {
        Tag: 'section',
        inner: (
          <>
            <Heading text={block.heading} />
            <Film demo={block.demo} labels={labels} texts={texts[block.demo] ?? {}} />
            {block.caption || block.source ? (
              <p className="film-caption">
                {block.caption}
                {block.source ? <small>{block.source}</small> : null}
              </p>
            ) : null}
          </>
        ),
      }
    default:
      return null
  }
}
