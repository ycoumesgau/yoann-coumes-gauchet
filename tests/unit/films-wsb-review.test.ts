import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { film as hostileReview } from '@/app/(frontend)/_films/hostile-review'
import type { FilmModule } from '@/app/(frontend)/_films/types'
import { WsbCurveThumb, film as wsbFunding, wsbFunded } from '@/app/(frontend)/_films/wsb-funding'

const keysOf = (prefix: string, n: number, parts: string[]) =>
  Array.from({ length: n }, (_, i) => parts.map((p) => `${prefix}.${i + 1}${p}`)).flat()

const wsbKeys = [
  ...keysOf('title', 7, ['']),
  ...keysOf('part', 7, ['']),
  'myPart',
  'point.firstLoan',
  'point.nov2017',
  'point.award',
  'point.sme',
  'point.realEstate',
  'point.freeze',
  'point.funded',
  'point.repayments',
  ...keysOf('tile', 6, ['.value', '.label']),
  'source',
]
const reviewKeys = [
  ...keysOf('caption', 4, ['']),
  'shipped',
  'rules',
  'rule.new',
  'change',
  'change.title',
  'change.fix',
  'review',
  'review.case',
  'check',
  'fails',
  'passes',
]

/** Each key's text is unique and recognisable: «key». */
const textsFor = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, `«${k}»`]))

const render = (f: FilmModule, t: number, width: number, texts: Record<string, string>) =>
  renderToStaticMarkup(
    createElement(
      'div',
      null,
      f.Stage({ t, playing: false, width, height: f.height(width), texts }),
    ),
  )

const cases: [string, FilmModule, string[]][] = [
  ['wsb-funding', wsbFunding, wsbKeys],
  ['hostile-review', hostileReview, reviewKeys],
]

describe.each(cases)('film %s', (_name, f, keys) => {
  for (const width of [1200, 390])
    for (const t of [0, f.duration]) {
      it(`renders every text it is given (t=${t}, width=${width})`, () => {
        const html = render(f, t, width, textsFor(keys))
        // The verdict of the check changes with time: only one is drawn at once.
        const expected = keys.filter((k) => !['fails', 'passes'].includes(k))
        for (const key of expected) expect(html, key).toContain(`«${key}»`)
      })
      it(`draws no word without texts (t=${t}, width=${width})`, () => {
        const html = render(f, t, width, {})
        const words = html
          .replace(/<[^>]*>/g, ' ')
          .split(/\s+/)
          .filter((w) => /[A-Za-z€]/.test(w))
        expect(words).toEqual([])
      })
    }

  it('has a positive height, wider for phones', () => {
    expect(f.height(1200)).toBeGreaterThan(0)
    expect(f.height(390) / 390).toBeGreaterThan(f.height(1200) / 1200)
  })

  it('plans cover the film end to end', () => {
    const [start] = f.plans[0]!
    const [lastStart, lastLength] = f.plans[f.plans.length - 1]!
    expect(start).toBe(0)
    expect(lastStart + lastLength).toBe(f.duration)
  })
})

describe('hostile-review verdict', () => {
  const texts = textsFor(reviewKeys)
  it('fails while the review breaks the change, passes once it is fixed', () => {
    expect(render(hostileReview, 4, 1200, texts)).toContain('«fails»')
    expect(render(hostileReview, 4, 1200, texts)).not.toContain('«passes»')
    expect(render(hostileReview, hostileReview.duration, 1200, texts)).toContain('«passes»')
  })
})

describe('wsb-funding curve', () => {
  it('passes through the real public points', () => {
    expect(wsbFunded(2015.5)).toBe(0)
    expect(wsbFunded(2016.55)).toBeCloseTo(0.2, 6)
    expect(wsbFunded(2017.85)).toBeCloseTo(3.5, 6)
    expect(wsbFunded(2020.3)).toBeCloseTo(50, 6)
    expect(wsbFunded(2024.6)).toBe(162)
    // The drawn curve reaches the total without a jump.
    expect(wsbFunded(2024.6 - 1e-9)).toBeCloseTo(162, 6)
    expect(wsbFunded(2023.3)).toBeCloseTo(150, 6)
  })

  it('never goes down and never overshoots the total', () => {
    let previous = 0
    for (let year = 2015; year <= 2025.5; year += 0.01) {
      const v = wsbFunded(year)
      expect(v).toBeGreaterThanOrEqual(previous - 1e-9)
      expect(v).toBeLessThanOrEqual(162)
      previous = v
    }
  })

  it('carries no "schematic" label (review U3)', () => {
    const html = render(wsbFunding, wsbFunding.duration, 1200, textsFor(wsbKeys))
    expect(html.toLowerCase()).not.toContain('schemati')
  })
})

describe('WsbCurveThumb', () => {
  const thumb = (texts: Record<string, string>) =>
    renderToStaticMarkup(createElement(WsbCurveThumb, { texts }))

  it('draws the prototype home card curve, ending at €162M', () => {
    const html = thumb(textsFor(['point.funded', 'point.repayments']))
    expect(html).toContain('viewBox="0 0 400 300"')
    // The final point of the prototype's card: (348.1, 56.2), the first loan at (67.6, 261.7).
    expect(html).toContain('cx="348.1" cy="56.2"')
    expect(html).toContain('cx="67.6" cy="261.7"')
    expect(html).toContain('M348.1 56.2 L384 56.2')
    expect(html).toContain('«point.funded»')
    expect(html).toContain('«point.repayments»')
  })

  it('draws no word without texts', () => {
    expect(thumb({})).not.toContain('<text')
  })
})
