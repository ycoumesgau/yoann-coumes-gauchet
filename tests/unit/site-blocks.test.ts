import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  advancesOn,
  isPlayerOrigin,
  playerState,
  youtubeSrc,
} from '@/app/(frontend)/_blocks/shorts'
import { footerLinkUrl, isOutboundUrl } from '@/domain/links'
import {
  deferredDetails,
  filmPairs,
  filmTextsByFilm,
  linkHref,
  RenderBlocks,
  stepFlags,
  timelineSpan,
  type PageBlock,
} from '@/app/(frontend)/_blocks/render-blocks'
import { isDemoKey } from '@/domain/demos'
import { GalleryBlock } from '@/blocks/gallery'

const body = { root: { type: 'root', children: [] } } as never

describe('links in blocks', () => {
  it("leads to a page in the reader's language, or to a web or mail address only", () => {
    const page = { id: 2, slug: 'nexcan', title: 'Nexcan' } as never
    expect(linkHref('fr', { label: 'Nexcan', page })).toBe('/fr/nexcan')
    expect(linkHref('en', { label: 'Site', url: 'https://nexcan.ai' })).toBe('https://nexcan.ai')
    expect(linkHref('en', { label: 'Mail', url: 'mailto:a@b.c' })).toBe('mailto:a@b.c')
    // A script, a relative path, or a page the reader may not see go nowhere.
    expect(linkHref('en', { label: 'x', url: 'javascript:alert(1)' })).toBeNull()
    expect(linkHref('en', { label: 'x', url: '/en/nexcan' })).toBeNull()
    expect(linkHref('en', { label: 'x', page: 2 })).toBeNull()
    expect(linkHref('en', null)).toBeNull()
  })
})

describe('method steps', () => {
  it('keeps the blocks after a numbered section in its column, up to the next heading', () => {
    const blocks = [
      { blockType: 'hero', headline: 'Method' },
      { blockType: 'section', number: '01', heading: 'Rules', body },
      { blockType: 'stats', items: [{ value: '1', label: 'x' }] },
      { blockType: 'section', body },
      { blockType: 'section', number: '02', heading: 'Review', body },
      { blockType: 'section', heading: 'After', body },
      { blockType: 'stats', items: [{ value: '1', label: 'x' }] },
    ] as PageBlock[]
    expect(stepFlags(blocks)).toEqual([null, 'step', 'in-step', 'in-step', 'step', null, null])
  })

  it('ends a step at a hero or at the links to what comes next', () => {
    const step = { blockType: 'section', number: '01', body } as PageBlock
    const after = { blockType: 'callout', body } as unknown as PageBlock
    const hero = { blockType: 'hero', headline: 'H' } as unknown as PageBlock
    const next = { blockType: 'nextLinks', links: [] } as unknown as PageBlock
    expect(stepFlags([step, hero, after])).toEqual(['step', null, null])
    expect(stepFlags([step, next, after])).toEqual(['step', null, null])
  })
})

describe('details of a step', () => {
  const details = (text: string) =>
    ({
      root: {
        type: 'root',
        children: [{ type: 'paragraph', children: [{ type: 'text', text, version: 1 }] }],
      },
    }) as never
  const steps: PageBlock[] = [
    {
      blockType: 'section',
      number: '01',
      heading: 'Rules',
      body,
      detailsLabel: 'More',
      details: details('rule details'),
    },
    { blockType: 'stats', items: [{ value: '1', label: 'stat one' }] },
    { blockType: 'section', body },
    { blockType: 'section', number: '02', heading: 'Review', body },
  ] as PageBlock[]
  const [rules, , , review] = steps as [PageBlock, PageBlock, PageBlock, PageBlock]

  it("moves a step's details under the last block of the step, as the prototype closes each step", () => {
    expect(deferredDetails(steps)).toEqual(new Map([[2, 0]]))
    const html = renderToStaticMarkup(RenderBlocks({ blocks: steps, locale: 'en' }))
    expect(html.split('rule details').length - 1).toBe(1)
    expect(html.indexOf('rule details')).toBeGreaterThan(html.indexOf('stat one'))
  })

  it('keeps the details when the last block of the step shows nothing', () => {
    const empty = {
      blockType: 'gallery',
      items: [{ image: 7 }],
    } as unknown as PageBlock
    const blocks = [...steps.slice(0, 2), empty]
    expect(deferredDetails(blocks, (i) => i !== 2)).toEqual(new Map([[1, 0]]))
    const html = renderToStaticMarkup(RenderBlocks({ blocks, locale: 'en' }))
    expect(html.split('rule details').length - 1).toBe(1)
    expect(html.indexOf('rule details')).toBeGreaterThan(html.indexOf('stat one'))
  })

  it('ties the summary of the details to the heading of its step', () => {
    const html = renderToStaticMarkup(RenderBlocks({ blocks: steps, locale: 'en' }))
    const id = /<h2 class="h2" id="([^"]+)">Rules</.exec(html)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`<summary aria-describedby="${id}">More</summary>`)
  })

  it('leaves the details in place when the step has nothing after it', () => {
    expect(deferredDetails([rules, review])).toEqual(new Map())
    const html = renderToStaticMarkup(RenderBlocks({ blocks: [rules], locale: 'en' }))
    expect(html).toContain('rule details')
  })
})

describe('lead paragraphs', () => {
  const html = (lead: boolean) =>
    renderToStaticMarkup(
      RenderBlocks({
        blocks: [{ blockType: 'section', heading: 'H', body, lead }] as PageBlock[],
        locale: 'en',
      }),
    )

  it('sets a section marked as a lead in the lead style, and no other', () => {
    expect(html(true)).toContain('class="rich lead-text"')
    expect(html(false)).not.toContain('lead-text')
  })
})

describe('hero measures', () => {
  const html = (headlineWidth?: string, subheadWidth?: string) =>
    renderToStaticMarkup(
      RenderBlocks({
        blocks: [
          {
            blockType: 'hero',
            headline: 'H',
            subhead: 'S',
            headlineWidth,
            subheadWidth,
          },
        ] as PageBlock[],
        locale: 'en',
      }),
    )

  it('caps the headline and the lead at the width chosen in Payload, and at none otherwise', () => {
    expect(html('16', '34')).toMatch(/<h1[^>]*data-measure="16"/)
    expect(html('16', '34')).toMatch(/<p class="lead" data-measure="34"/)
    expect(html()).not.toContain('data-measure')
  })
})

describe('work rows', () => {
  const image = (url: string) =>
    ({
      id: 1,
      url,
      alt: 'alt',
      width: 800,
      height: 600,
      mimeType: 'image/png',
    }) as never
  const html = (illustration: unknown) =>
    renderToStaticMarkup(
      RenderBlocks({
        blocks: [
          {
            blockType: 'workRows',
            rows: [
              {
                title: 'Licorn',
                image: image('/forum.webp'),
                imageCaption: 'Licorn forum',
                illustration: illustration as never,
              },
            ],
          },
        ] as PageBlock[],
        locale: 'en',
      }),
    )

  it('draws an illustration beside the screenshot, and the screenshot alone without one', () => {
    expect(html(image('/milo.png'))).toContain('class="work-pair"')
    expect(html(image('/milo.png'))).toContain('class="work-illustration"')
    expect(html(image('/milo.png'))).toContain('milo.png')
    expect(html(image('/milo.png'))).toContain('work-pair-caption')
    expect(html(null)).not.toContain('work-pair')
    expect(html(null)).toContain('forum.webp')
  })

  it('prints the caption once under the pair', () => {
    expect(html(image('/milo.png')).split('Licorn forum').length - 1).toBe(1)
  })

  it('drops an illustration the visitor may not read: a bare id, or no alt in this language', () => {
    for (const unreadable of [7, { ...(image('/milo.png') as object), alt: null }]) {
      expect(html(unreadable)).not.toContain('work-pair')
      expect(html(unreadable)).toContain('forum.webp')
    }
  })
})

describe('callouts and galleries', () => {
  const html = (blocks: unknown[]) =>
    renderToStaticMarkup(RenderBlocks({ blocks: blocks as PageBlock[], locale: 'en' }))

  it('draws the link of an accent callout as a pill, and a plain one as a text link', () => {
    const callout = (tone: string) => ({
      blockType: 'callout',
      tone,
      body: 'B',
      link: { label: 'Contact', url: 'mailto:a@b.c' },
    })
    expect(html([callout('accent')])).toContain('class="pill-link"')
    expect(html([callout('plain')])).not.toContain('pill-link')
  })

  it('gives a card the tone of its badge, live unless chosen, and no tone without a badge', () => {
    const image = {
      id: 1,
      url: '/a.webp',
      alt: 'alt',
      width: 8,
      height: 8,
      mimeType: 'image/webp',
    }
    const card = (badge?: string, badgeTone?: string) =>
      html([
        {
          blockType: 'gallery',
          variant: 'cards',
          items: [{ image, title: 'Lili', badge, badgeTone }],
        },
      ])
    expect(card('in progress', 'private')).toMatch(/<li[^>]*data-tone="private"/)
    expect(card('in progress', 'private')).toMatch(/class="status" data-tone="private"/)
    expect(card('in use')).toMatch(/<li[^>]*data-tone="live"/)
    expect(card()).not.toMatch(/<li[^>]*data-tone/)
  })

  it('reads a badge as live unless Payload says otherwise, as Fred is in the prototype', () => {
    const items = GalleryBlock.fields.find((f) => 'name' in f && f.name === 'items')
    const tone =
      items && 'fields' in items
        ? items.fields.find((f) => 'name' in f && f.name === 'badgeTone')
        : undefined
    expect(tone && 'defaultValue' in tone ? tone.defaultValue : undefined).toBe('live')
  })

  it('marks a gallery of screenshots, so its tags sit where the prototype puts them', () => {
    const image = {
      id: 1,
      url: '/s.webp',
      alt: 'alt',
      width: 800,
      height: 600,
      mimeType: 'image/webp',
    }
    expect(html([{ blockType: 'gallery', items: [{ image, tag: 'illustration' }] }])).toContain(
      'class="gallery" data-variant="screens"',
    )
  })
})

describe('fact lists and columns', () => {
  const html = (blocks: unknown[]) =>
    renderToStaticMarkup(RenderBlocks({ blocks: blocks as PageBlock[], locale: 'en' }))

  it('lays a fact list out in the columns chosen in Payload, two unless chosen', () => {
    const facts = (columns?: string) =>
      html([
        {
          blockType: 'factList',
          columns,
          items: [{ lead: 'Product.', body: 'B' }],
        },
      ])
    expect(facts('3')).toContain('class="facts" data-columns="3"')
    expect(facts()).toContain('class="facts" data-columns="2"')
  })

  it('sets the headings of side-by-side texts at the size chosen in Payload, large unless chosen', () => {
    const columns = (headingSize?: string) =>
      html([
        {
          blockType: 'columns',
          headingSize,
          columns: [{ heading: 'H', body }],
        },
      ])
    expect(columns('small')).toContain('class="columns" data-heading="small"')
    expect(columns()).toContain('class="columns" data-heading="large"')
  })
})

describe('nexcan blocks', () => {
  const html = (blocks: unknown[]) =>
    renderToStaticMarkup(RenderBlocks({ blocks: blocks as PageBlock[], locale: 'en' }))
  const items = [
    { value: 'April 2026', label: 'first automations' },
    { value: 'October 2026', label: 'company incorporated' },
  ]

  it('lists dates beside a text, numbered, and figures without one as figures', () => {
    const dated = html([{ blockType: 'stats', items, body }])
    expect(dated).toContain('class="dates"')
    expect(dated).toMatch(/<span class="date-index" aria-hidden="true">02<\/span>/)
    const figures = html([{ blockType: 'stats', items }])
    expect(figures).toContain('class="stats"')
    expect(figures).not.toContain('class="dates"')
  })

  it('marks a numbered fact list, and no other', () => {
    const facts = (numbered: boolean) =>
      html([
        {
          blockType: 'factList',
          numbered,
          items: [{ lead: 'Totals.', body: 'B' }],
        },
      ])
    expect(facts(true)).toMatch(/class="facts"[^>]*data-numbered=""/)
    expect(facts(false)).not.toContain('data-numbered')
  })

  it('sets two films in a row side by side, unless one has a heading or sits in a step', () => {
    const film = (demo: string, heading?: string) => ({
      blockType: 'demo',
      demo,
      heading,
    })
    const step = { blockType: 'section', number: '01', body }
    expect(filmPairs([film('nexcan-screening'), film('nexcan-photos')] as PageBlock[])).toEqual(
      new Map([[0, 1]]),
    )
    expect(
      filmPairs([film('nexcan-screening'), film('nexcan-photos', 'Photos')] as PageBlock[]),
    ).toEqual(new Map())
    expect(
      filmPairs([step, film('nexcan-screening'), film('nexcan-photos')] as PageBlock[]),
    ).toEqual(new Map())
    expect(filmPairs([film('nope'), film('nexcan-photos')] as PageBlock[])).toEqual(new Map())
    const three = [film('nexcan-screening'), film('nexcan-photos'), film('hostile-review')]
    expect(filmPairs(three as PageBlock[])).toEqual(new Map([[0, 1]]))
    const markup = html([film('nexcan-screening'), film('nexcan-photos')])
    expect(markup.split('class="block film-pair"').length - 1).toBe(1)
    expect(markup.split('class="film"').length - 1).toBe(2)
  })
})

describe('about blocks', () => {
  const html = (blocks: unknown[]) =>
    renderToStaticMarkup(RenderBlocks({ blocks: blocks as PageBlock[], locale: 'en' }))

  it('gives each timeline cell its tone and its span, past and one unless chosen', () => {
    const markup = html([
      {
        blockType: 'timeline',
        entries: [
          { period: '2015 – 2024', title: 'WeShareBonds', tone: 'highlight', span: 7 },
          { period: '2012', title: 'Saint-Gobain Isover' },
        ],
      },
    ])
    expect(markup).toContain('<li data-tone="highlight" style="--span:7">')
    expect(markup).toContain('<li data-tone="past" style="--span:1">')
  })

  it("reads a span outside Payload's range as one", () => {
    expect(timelineSpan(1.3)).toBe(1.3)
    expect(timelineSpan(12)).toBe(12)
    expect(timelineSpan(0)).toBe(1)
    expect(timelineSpan(13)).toBe(1)
    expect(timelineSpan(Number.NaN)).toBe(1)
    expect(timelineSpan(null)).toBe(1)
  })

  it('leaves no space between a bold lead and the punctuation that follows it', () => {
    const fact = (lead: string, body: string) =>
      html([{ blockType: 'factList', items: [{ lead, body }] }])
    expect(fact('Phillimore', ', private equity')).toContain(
      '<strong>Phillimore</strong>, private equity',
    )
    expect(fact('Product.', 'I designed')).toContain('<strong>Product. </strong>I designed')
  })

  it('sets dated links as cards, and keeps a list with a contact line as rows', () => {
    const dated = { period: '2007 – 2013', title: 'INSA Lyon', body: 'B', url: 'https://a.fr' }
    const contact = { title: 'LinkedIn', url: 'https://b.fr' }
    expect(html([{ blockType: 'linkList', items: [dated] }])).toContain(
      'class="links" data-variant="cards"',
    )
    const mixed = html([{ blockType: 'linkList', items: [dated, contact] }])
    expect(mixed).toContain('class="links"')
    expect(mixed).not.toContain('data-variant')
  })
})

describe('films and players', () => {
  it('knows only the films of the closed list', () => {
    expect(isDemoKey('nexcan-inventory')).toBe(true)
    expect(isDemoKey('paper-to-deliverable')).toBe(false)
    expect(isDemoKey(undefined)).toBe(false)
  })

  it('starts a YouTube video only once the visitor asked for it', () => {
    expect(youtubeSrc('https://www.youtube-nocookie.com/embed/x', false)).not.toContain('autoplay')
    expect(youtubeSrc('https://www.youtube-nocookie.com/embed/x', true)).toContain('autoplay=1')
  })

  it("reads the end of a video from the player's messages", () => {
    expect(playerState('{"event":"onStateChange","info":0}')).toBe(0)
    expect(playerState({ event: 'infoDelivery', info: { playerState: 1 } })).toBe(1)
    expect(playerState('not json')).toBeNull()
    expect(playerState('{"event":"onReady"}')).toBeNull()
    expect(playerState('{"event":"onStateChange","info":"0"}')).toBeNull()
  })
})

describe('film texts', () => {
  it('groups the words of each film by key, and skips a missing translation', () => {
    expect(
      filmTextsByFilm([
        { film: 'wsb-funding', key: 'total', text: '€162M funded' },
        { film: 'hostile-review', key: 'total', text: 'Blocking' },
        { film: 'wsb-funding', key: 'note', text: null as never },
      ]),
    ).toEqual({
      'wsb-funding': { total: '€162M funded' },
      'hostile-review': { total: 'Blocking' },
    })
    expect(filmTextsByFilm(undefined)).toEqual({})
  })
})

describe('the series of shorts', () => {
  it("hears only YouTube's own players", () => {
    expect(isPlayerOrigin('https://www.youtube-nocookie.com')).toBe(true)
    expect(isPlayerOrigin('https://www.youtube.com')).toBe(true)
    expect(isPlayerOrigin('https://www.youtube.com.evil.example')).toBe(false)
    expect(isPlayerOrigin('https://evil.example')).toBe(false)
    expect(isPlayerOrigin('http://www.youtube.com')).toBe(false)
  })

  it('moves on once per video, though YouTube reports the end twice', () => {
    expect(advancesOn(null, 'a')).toBe(true)
    expect(advancesOn('a', 'a')).toBe(false)
    expect(advancesOn('a', 'b')).toBe(true)
  })
})

describe('addresses', () => {
  it('lets a block link leave the site only to a web or mail address', () => {
    expect(isOutboundUrl('https://a.b')).toBe(true)
    expect(isOutboundUrl('mailto:a@b.c')).toBe(true)
    expect(isOutboundUrl('javascript:alert(1)')).toBe(false)
    expect(isOutboundUrl('/fr/nexcan')).toBe(false)
  })

  it('stores a footer link only as a web address or a path of this site', () => {
    expect(footerLinkUrl('https://www.linkedin.com/in/ycoumesgau')).toBe(true)
    expect(footerLinkUrl('/privacy')).toBe(true)
    expect(footerLinkUrl('mailto:someone@example.com')).toBe(true)
    expect(footerLinkUrl('javascript:alert(1)')).not.toBe(true)
    expect(footerLinkUrl('data:text/html,x')).not.toBe(true)
    expect(footerLinkUrl('//evil.example')).not.toBe(true)
    expect(footerLinkUrl('')).not.toBe(true)
  })
})
