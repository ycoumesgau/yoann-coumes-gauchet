import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { film as accountingAgent } from '@/app/(frontend)/_films/accounting-agent'
import { film as recipe2videoChecks } from '@/app/(frontend)/_films/recipe2video-checks'
import type { FilmModule } from '@/app/(frontend)/_films/types'

const render = (film: FilmModule, t: number, width: number, texts: Record<string, string>) =>
  renderToStaticMarkup(createElement(film.Stage, { t, playing: false, width, texts }))

/** Every key a film reads, each with a distinct marker as its text. */
const marked = (keys: readonly string[]) =>
  Object.fromEntries(keys.map((key) => [key, `«${key}»`])) as Record<string, string>

const r2vRows = ['01', '02', '03', '04', '05', '06', '07']
const r2vKeys = [
  'head',
  'sub',
  'caption.written',
  'caption.caught',
  'caption.passed',
  ...r2vRows.flatMap((n) => [`row.${n}.title`, `row.${n}.duration`, `row.${n}.rule`]),
  'row.04.flag',
  'row.04.fix',
  'total',
  'video.title',
  'video.play',
  'tag',
]
const agentKeys = [
  'title',
  'item.bank',
  'item.receipts',
  'item.intercompany',
  'item.vat',
  'expense',
  'verdict.ready',
  'verdict.review',
  'verdict.notReady',
  'entry.label',
  'go',
  'say',
  'tag',
]

/** Keys a frame does not show: the passing frame hides the mold's red and its fix. */
const notOnLastFrame = new Set(['row.04.flag', 'row.04.fix'])

describe.each([
  ['recipe2video-checks', recipe2videoChecks, r2vKeys],
  ['accounting-agent', accountingAgent, agentKeys],
] as const)('film %s', (_name, film, keys) => {
  it('has its shots inside its duration, and a height at both widths', () => {
    for (const [start, length] of film.plans) {
      expect(start).toBeGreaterThanOrEqual(0)
      expect(start + length).toBeLessThanOrEqual(film.duration + 1e-9)
    }
    expect(film.height(1200)).toBeGreaterThan(0)
    expect(film.height(390)).toBeGreaterThan(film.height(1200) * 0.5)
  })

  it.each([1200, 390])('draws every word it is given on its last frame, at %i px', (width) => {
    const html = render(film, film.duration, width, marked(keys))
    for (const key of keys) {
      if (notOnLastFrame.has(key)) continue
      expect(html).toContain(`«${key}»`)
    }
  })

  it.each([1200, 390])('renders at t = 0, at %i px', (width) => {
    const html = render(film, 0, width, marked(keys))
    expect(html.length).toBeGreaterThan(0)
  })

  it.each([1200, 390])('draws no word without its text, at %i px', (width) => {
    for (const t of [0, film.duration]) {
      const html = render(film, t, width, {})
      // Only markup, card numbers and check marks: no word outside a tag.
      const visible = html.replace(/<[^>]*>/g, '').replace(/[\d✓!\s]/g, '')
      expect(visible).toBe('')
      expect(html).not.toContain('undefined')
    }
  })
})

describe('film recipe2video-checks', () => {
  const texts = marked(r2vKeys)

  it('shows the mold in red, then its fix, before every card turns green', () => {
    expect(render(recipe2videoChecks, 7, 1200, texts)).toContain('«row.04.flag»')
    expect(render(recipe2videoChecks, 7, 1200, texts)).not.toContain('«row.04.rule»')
    expect(render(recipe2videoChecks, 8.5, 1200, texts)).toContain('«row.04.fix»')
    expect(render(recipe2videoChecks, 7, 1200, texts)).toContain('var(--anom)')
  })

  it('ends on the Short, played from YouTube only after a click', () => {
    const html = render(recipe2videoChecks, recipe2videoChecks.duration, 390, texts)
    expect(html).toContain('https://i.ytimg.com/vi/LtwZ65Jc2eY/hqdefault.jpg')
    expect(html).not.toContain('<iframe')
  })
})

describe('film accounting-agent', () => {
  it('ticks bank, intercompany flows and VAT, and leaves receipts open', () => {
    const html = render(accountingAgent, accountingAgent.duration, 1200, marked(agentKeys))
    expect(html.match(/✓/g)).toHaveLength(3)
    expect(html.match(/>!</g)).toHaveLength(1)
  })
})
