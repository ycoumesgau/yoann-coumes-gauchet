import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  opensOnHero,
  PageTitle,
  readableImage,
  RenderBlocks,
  type PageBlock,
} from '@/app/(frontend)/_blocks/render-blocks'
import type { Media, Project } from '@/payload-types'

const render = (blocks: PageBlock[]) =>
  renderToStaticMarkup(createElement(RenderBlocks, { blocks, locale: 'en' }))

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '',
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        direction: null,
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        children: [
          { type: 'text', version: 1, text, format: 0, style: '', mode: 'normal', detail: 0 },
        ],
      },
    ],
  },
})

describe('blocks', () => {
  it('loads each player with the page, the shorts aside, only from a URL the site rebuilds (ADR-4)', () => {
    const html = render([
      {
        blockType: 'videoCarousel',
        heading: 'Videos',
        videos: [{ platform: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'A recipe' }],
      },
      { blockType: 'spotify', heading: 'Playlist', ref: 'playlist:32nEjBqPrGjsohHLfqVhI9' },
    ])
    // The series of shorts shows a still until the visitor presses play (Amendment 2).
    expect(html).not.toContain('youtube-nocookie.com')
    expect(html).toContain('src="https://open.spotify.com/embed/playlist/32nEjBqPrGjsohHLfqVhI9"')
    expect(html.match(/<iframe[^>]*loading="lazy"/g)).toHaveLength(1)
    expect(html).not.toContain('autoplay')
  })

  it('shows no video whose id the site would refuse', () => {
    const html = render([
      {
        blockType: 'videoCarousel',
        videos: [{ platform: 'instagram', videoId: '../../evil', title: 'Raw write' }],
      },
    ])
    expect(html).not.toContain('<iframe')
  })

  it('gives the page one h1: the opening hero, or the title', () => {
    const hero: PageBlock = { blockType: 'hero', headline: 'Builder' }
    expect(opensOnHero([hero])).toBe(true)
    expect(opensOnHero([])).toBe(false)
    expect(render([hero])).toContain('<h1 class="h1">Builder</h1>')
    expect(
      render([{ blockType: 'timeline', entries: [{ period: '2015', title: 'x' }] }, hero]),
    ).toContain('<h2 class="h1">Builder</h2>')
  })

  it('renders rich text and leaves out what the visitor may not read', () => {
    const html = render([
      { blockType: 'section', heading: 'About', body: paragraph('Hands-on.') as never },
      // An unpublished project arrives as a bare id.
      { blockType: 'projectCards', heading: 'Projects', projects: [42] },
    ])
    expect(html).toContain(
      '<h2 class="h2"><span class="h-mark" aria-hidden="true"></span>About</h2>',
    )
    expect(html).toContain('Hands-on.')
    expect(html).not.toContain('42')
    expect(html).not.toContain('<li')
  })

  it('puts the title in the h1 only when no hero opens the page', () => {
    const title = (layout: PageBlock[]) =>
      renderToStaticMarkup(createElement(PageTitle, { page: { title: 'Nexcan', layout } }))
    expect(title([])).toBe('<header class="block hero"><h1 class="h1">Nexcan</h1></header>')
    expect(title([{ blockType: 'hero', headline: 'Builder' }])).toBe('')
  })

  it('shows an image only with its text alternative in this language', () => {
    const image = {
      id: 1,
      url: '/api/media/file/a.png',
      alt: 'A kitchen',
      width: 800,
      height: 600,
      mimeType: 'image/png',
    } as Media
    expect(readableImage(image)).toBe(image)
    // `alt` is localized and read without fallback: missing in French, null.
    expect(readableImage({ ...image, alt: null } as unknown as Media)).toBeNull()
    expect(readableImage({ ...image, mimeType: 'video/mp4' })).toBeNull()
    expect(readableImage({ ...image, url: null })).toBeNull()
    expect(readableImage(7)).toBeNull()
    expect(readableImage(null)).toBeNull()
  })

  it('names a player by its content, and by its provider alone without a heading', () => {
    const named = render([
      { blockType: 'spotify', heading: 'Songs', ref: 'album:4aawyAB9vmqN3uQ7FjRGTy' },
    ])
    expect(named).toContain('title="Songs · Spotify"')
    const bare = render([{ blockType: 'spotify', ref: 'album:4aawyAB9vmqN3uQ7FjRGTy' }])
    expect(bare).toContain('title="Spotify"')
    // A reference the site cannot rebuild shows nothing.
    expect(render([{ blockType: 'spotify', heading: 'Songs', ref: 'https://evil.example' }])).toBe(
      '',
    )
  })

  it('links a project to its page only when that page is readable, and keeps headings in order', () => {
    const project = {
      id: 1,
      name: 'Nexcan',
      slug: 'nexcan',
      tagline: 't',
      period: 'p',
      summary: 's',
    } as Project
    const linked = render([
      {
        blockType: 'projectCards',
        projects: [{ ...project, page: { id: 2, slug: 'nexcan', title: 'Nexcan' } as never }],
      },
    ])
    expect(linked).toContain('<h2 class="h3"><a href="/en/nexcan">Nexcan</a></h2>')
    const unlinked = render([
      { blockType: 'projectCards', heading: 'Work', projects: [{ ...project, page: 2 }] },
    ])
    expect(unlinked).toContain('<h3 class="h3">Nexcan</h3>')
    expect(unlinked).not.toContain('href')
    const timeline = render([{ blockType: 'timeline', entries: [{ period: '2015', title: 'x' }] }])
    expect(timeline).toContain('<h2 class="t-title">x</h2>')
  })

  it('renders nothing for a project block whose projects are all unreadable', () => {
    expect(render([{ blockType: 'projectCards', heading: 'Projects', projects: [42] }])).toBe('')
  })
})
