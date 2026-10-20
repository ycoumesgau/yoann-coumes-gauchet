import { describe, expect, it } from 'vitest'

import { playerState, youtubeSrc } from '@/app/(frontend)/_blocks/shorts'
import { linkHref, stepFlags, type PageBlock } from '@/app/(frontend)/_blocks/render-blocks'
import { isDemoKey } from '@/domain/demos'

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
