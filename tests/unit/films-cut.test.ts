import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { film as accountingAgent } from '@/app/(frontend)/_films/accounting-agent'
import { MIN_STAGE } from '@/app/(frontend)/_films/fit'
import { film as hostileReview } from '@/app/(frontend)/_films/hostile-review'
import type { FilmModule } from '@/app/(frontend)/_films/types'
import { film as wsbFunding } from '@/app/(frontend)/_films/wsb-funding'

/** A phone screen that leaves the stage less than the film asks for (fit.ts). */
const W = 375
const CUT = 440

const draw = (film: FilmModule, t: number, height: number, texts: Record<string, string>) =>
  renderToStaticMarkup(createElement(film.Stage, { t, playing: false, width: W, height, texts }))

/** Each key's text is a marker: «key». */
const marked = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, `«${k}»`]))

/** The opacity in the style of the element that wraps `marker` and folds (has a max-height), if any. */
const foldAround = (html: string, marker: string) => {
  const at = html.indexOf(marker)
  const open = html.lastIndexOf('max-height:', at)
  if (open < 0) return undefined
  const style = html.slice(open, html.indexOf('"', open))
  return {
    height: Number(/max-height:([\d.]+)px/.exec(style)?.[1]),
    opacity: Number(/opacity:([\d.]+)/.exec(style)?.[1]),
  }
}

describe('films cut to fit a phone screen', () => {
  it('are cut to no less than the height every narrow layout is drawn for', () => {
    for (const film of [hostileReview, accountingAgent, wsbFunding])
      expect(film.height(W)).toBeGreaterThan(MIN_STAGE)
  })

  it('hostile review: the review and its check give way to the shipped list and the rules', () => {
    const texts = marked(['review', 'review.case', 'check', 'shipped', 'rules', 'rule.new'])
    const end = draw(hostileReview, hostileReview.duration, CUT, texts)
    expect(foldAround(end, '«review.case»')).toEqual({ height: 0, opacity: 0 })
    expect(end).toContain('«rule.new»')
    // before the change ships, the review is there
    const before = draw(hostileReview, 5, CUT, texts)
    expect(foldAround(before, '«review.case»')?.opacity).toBe(1)
    // with room for the whole column, nothing gives way
    const full = draw(hostileReview, hostileReview.duration, 700, texts)
    expect(foldAround(full, '«review.case»')).toBeUndefined()
  })

  it('accounting agent: the missing receipt and the title fold away as the entry arrives', () => {
    const texts = marked(['title', 'expense', 'entry.label'])
    const missing = (html: string) =>
      /max-height:(\d+)px[^"]*"><span[^>]*><\/span><span>«expense»/.exec(html)?.[1]
    expect(missing(draw(accountingAgent, 5, CUT, texts))).toBe('40')
    expect(missing(draw(accountingAgent, accountingAgent.duration, CUT, texts))).toBe('0')
    // the checklist's title folds with it
    expect(draw(accountingAgent, accountingAgent.duration, CUT, texts)).toMatch(
      /max-height:0px;overflow:hidden;opacity:0">«title»/,
    )
    expect(
      missing(draw(accountingAgent, accountingAgent.duration, accountingAgent.height(W), texts)),
    ).toBe('40')
  })

  it('WeShareBonds: the chart keeps its height, under the tiles at the end', () => {
    // The chart's two horizontal lines: the total (its top) and the axis (its foot).
    const lines = (html: string) =>
      [...html.matchAll(/d="M[\d.]+ ([\d.]+) L[\d.]+ \1"/g)].map((m) => Number(m[1]))
    for (const H of [CUT, 400, MIN_STAGE]) {
      const ys = lines(draw(wsbFunding, wsbFunding.duration, H, {}))
      const top = Math.min(...ys)
      const foot = Math.max(...ys)
      // the six tiles, two by row, and their source end above the chart
      expect(top, `H=${H}`).toBeGreaterThanOrEqual(16 + 3 * (60 + 8) - 8 + 44)
      expect(foot - top, `H=${H}`).toBeGreaterThanOrEqual(H - 64 - 256 - 12)
      expect(foot).toBeLessThanOrEqual(H)
    }
    // During the story, the chart starts right under the shot's words.
    const story = lines(draw(wsbFunding, 10, CUT, {}))
    expect(Math.max(...story) - 190).toBeGreaterThan(150)
  })
})
