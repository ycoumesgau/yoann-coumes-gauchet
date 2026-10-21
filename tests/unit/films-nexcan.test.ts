import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { FrameLabels } from '@/app/(frontend)/_blocks/render-blocks'
import { Film, films } from '@/app/(frontend)/_films/film'
import type { FilmModule } from '@/app/(frontend)/_films/types'
import { phoneTop } from '@/app/(frontend)/_films/nexcan-photos'
import { cutAt, videoTime } from '@/app/(frontend)/_films/video-sync'
import type { DemoKey } from '@/domain/demos'

/** Every word a film draws, by key; the values are markers, so a test sees which ones render. */
const words: Record<string, Record<string, string>> = {
  'nexcan-inventory': { chip1: 'W-chip1', stillAlt: 'W-stillAlt' },
  'nexcan-screening': { chip1: 'W-chip1', chip2: 'W-chip2' },
  'nexcan-photos': { stillAlt: 'W-stillAlt' },
}
/** When each word is on screen (the poster is the last frame). */
const shownAt: Record<string, Record<string, number>> = {
  'nexcan-inventory': { chip1: 6, stillAlt: 10 },
  'nexcan-screening': { chip1: 3, chip2: 7 },
  'nexcan-photos': { stillAlt: 10 },
}

const nexcan = Object.keys(words) as DemoKey[]
const stage = (film: FilmModule, t: number, width: number, texts: Record<string, string>) =>
  renderToStaticMarkup(
    createElement(film.Stage, { t, playing: false, width, height: film.height(width), texts }),
  )

describe('the Nexcan films', () => {
  for (const key of nexcan) {
    const film = films[key]!
    describe(key, () => {
      it('is in the registry, with shots that cover its duration', () => {
        expect(film).toBeDefined()
        const [lastAt, lastLength] = film.plans[film.plans.length - 1]!
        expect(lastAt + lastLength).toBe(film.duration)
        expect(film.height(1200)).toBeLessThan(1200)
        expect(film.height(390)).toBeGreaterThan(390)
      })

      for (const width of [1200, 390])
        for (const t of [0, film.duration]) {
          it(`draws at ${width} px, t = ${t}`, () => {
            const html = stage(film, t, width, words[key]!)
            expect(html.length).toBeGreaterThan(0)
            expect(html).not.toContain('undefined')
            expect(html).not.toContain('NaN')
          })
        }

      it('draws each of its words when it is on screen, at both widths', () => {
        for (const width of [1200, 390])
          for (const [word, at] of Object.entries(shownAt[key]!))
            expect(stage(film, at, width, words[key]!)).toContain(`W-${word}`)
      })

      it('draws nothing for a missing word, and no English of its own', () => {
        for (const width of [1200, 390])
          for (const t of [0, 3, 6, film.duration]) {
            const html = stage(film, t, width, {})
            expect(html).not.toContain('W-')
            // Text nodes left once tags are gone: numerals only (counters, lot numbers).
            const text = html.replace(/<[^>]*>/g, ' ')
            expect(text).not.toMatch(/[A-Za-z]/)
          }
      })
    })
  }

  it("plays the real capture of Nexcan's demo D, the phone one on a phone", () => {
    const film = films['nexcan-photos']!
    expect(stage(film, 0, 1200, {})).toContain('/films/photos-d-1440.webm')
    expect(stage(film, 0, 390, {})).toContain('/films/photos-d-390.webm')
    expect(stage(film, film.duration, 390, {})).toContain('/films/photos-d-390.webp')
  })

  it('follows the action down the phone capture, inside it', () => {
    // A window of 470 px of capture: the jumble at the top, the touch-up of
    // lot 46 (down to 845 px), the doubtful lot 43 (from 150), the button and the end (958).
    expect(phoneTop(1, 470)).toBe(0)
    expect(phoneTop(6, 470)).toBe(845 - 470)
    expect(phoneTop(8, 470)).toBe(150)
    expect(phoneTop(10, 470)).toBe(958 - 470)
    // a window as tall as the capture never moves
    for (const t of [0, 3, 6, 8, 10]) expect(phoneTop(t, 958)).toBe(0)
  })

  it("covers the prototype's own footer and controls on a phone", () => {
    // 390 px wide, 470 px of capture shown at the end: the footer starts at 900
    const film = films['nexcan-photos']!
    const scale = 390 / 338
    const H = Math.round(470 * scale)
    const html = renderToStaticMarkup(
      createElement(film.Stage, {
        t: film.duration,
        playing: false,
        width: 390,
        height: H,
        texts: {},
      }),
    )
    const top = Math.round((900 - phoneTop(film.duration, H / scale)) * scale)
    expect(html).toContain(`top:${top}px;bottom:0`)
  })

  it('cuts the inventory film between the two real captures', () => {
    const cuts = [
      { video: 'b', at: 0, length: 2, from: 3.6, rate: 1 },
      { video: 's', at: 2, length: 3, from: 4, rate: 2 },
    ]
    expect(cutAt(cuts, 1).video).toBe('b')
    expect(cutAt(cuts, 2.5).video).toBe('s')
    expect(cutAt(cuts, 99).video).toBe('s')
    expect(videoTime(cuts[1]!, 3, 10.52)).toBeCloseTo(6)
    expect(videoTime(cuts[1]!, 5, 6)).toBeCloseTo(5.95)
    expect(videoTime(cuts[0]!, 1, Number.NaN)).toBeCloseTo(4.6)
  })
})

describe('the film shell', () => {
  const labels = {
    play: 'L-play',
    pause: 'L-pause',
    replay: 'L-replay',
    restart: 'L-restart',
  } as FrameLabels
  const texts = {
    number: 'T-number',
    tag: 'T-tag',
    caption: 'T-caption',
    shot: 'T-shot',
    chip1: 'W-chip1',
    stillAlt: 'W-stillAlt',
  }
  const render = (demo: DemoKey, still = false, t: Record<string, string> = texts) =>
    renderToStaticMarkup(createElement(Film, { demo, labels, texts: t, still }))

  it('shows the last frame as the poster, with its chrome and a play button', () => {
    const html = render('nexcan-inventory')
    for (const word of ['T-number', 'T-tag', 'T-caption', 'L-play', 'L-restart'])
      expect(html).toContain(word)
    expect(html).not.toContain('L-pause')
    // one segment per shot, each named
    for (const n of [1, 2, 3, 4]) expect(html).toContain(`aria-label="T-shot ${n}"`)
    expect(html).not.toContain('T-shot 5')
    // the poster is the final frame: the signed report, not the first cut
    expect(html).toContain('/films/signature-1440.png')
    expect(html).toContain('alt="W-stillAlt"')
  })

  it('draws no chrome word that the CMS does not give', () => {
    const html = renderToStaticMarkup(
      createElement(Film, { demo: 'nexcan-photos', labels: {} as FrameLabels, texts: {} }),
    )
    expect(html.replace(/<[^>]*>/g, ' ')).not.toMatch(/[A-Za-z]/)
  })

  it('renders the still alone, without chrome', () => {
    const html = render('nexcan-inventory', true)
    expect(html).toContain('class="film-still"')
    expect(html).toContain('/films/signature-1440.png')
    for (const word of ['T-number', 'T-tag', 'T-caption', 'L-play', 'L-restart'])
      expect(html).not.toContain(word)
  })

  it('renders nothing for a film whose module is not written yet', () => {
    const missing = (
      ['wsb-funding', 'hostile-review', 'recipe2video-checks', 'accounting-agent'] as const
    ).filter((key) => !films[key])
    for (const key of missing) {
      expect(render(key)).toBe('')
      expect(render(key, true)).toBe('')
    }
  })
})
