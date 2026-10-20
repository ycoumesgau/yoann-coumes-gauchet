import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { opensOnHero, RenderBlocks, type PageBlock } from '@/app/(frontend)/_blocks/render-blocks'

const render = (blocks: PageBlock[]) =>
  renderToStaticMarkup(
    createElement(RenderBlocks, { blocks, locale: 'en', notice: 'Loads a third party.' }),
  )

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
  it('requests nothing from a provider before the click (ADR-4)', () => {
    const html = render([
      {
        blockType: 'videoCarousel',
        heading: 'Videos',
        videos: [{ platform: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'A recipe' }],
      },
      { blockType: 'spotify', heading: 'Playlist', ref: 'playlist:32nEjBqPrGjsohHLfqVhI9' },
    ])
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('youtube')
    expect(html).not.toContain('spotify.com')
    expect(html).toContain('A recipe')
    expect(html).toContain('Loads a third party.')
  })

  it('gives the page one h1: the opening hero, or the title', () => {
    const hero: PageBlock = { blockType: 'hero', headline: 'Builder' }
    expect(opensOnHero([hero])).toBe(true)
    expect(opensOnHero([])).toBe(false)
    expect(render([hero])).toContain('<h1>Builder</h1>')
    expect(
      render([{ blockType: 'timeline', entries: [{ period: '2015', title: 'x' }] }, hero]),
    ).toContain('<h2>Builder</h2>')
  })

  it('renders rich text and leaves out what the visitor may not read', () => {
    const html = render([
      { blockType: 'section', heading: 'About', body: paragraph('Hands-on.') as never },
      // An unpublished project arrives as a bare id.
      { blockType: 'projectCards', heading: 'Projects', projects: [42] },
    ])
    expect(html).toContain('<h2>About</h2>')
    expect(html).toContain('Hands-on.')
    expect(html).not.toContain('42')
    expect(html).not.toContain('<li')
  })
})
