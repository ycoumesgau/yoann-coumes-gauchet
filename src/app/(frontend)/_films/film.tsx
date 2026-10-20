'use client'

import type { DemoKey } from '@/domain/demos'

import type { FrameLabels } from '../_blocks/render-blocks'

/**
 * One film by key. Each film is its own component in this folder; until it is
 * written, its still stands in (the last frame, as a poster).
 */
const stills: Partial<Record<DemoKey, { src: string; width: number; height: number }>> = {
  'nexcan-inventory': { src: '/films/demo-b-1440.png', width: 1440, height: 900 },
  'nexcan-screening': { src: '/films/lcbft-c-1440.png', width: 1440, height: 900 },
  'nexcan-photos': { src: '/films/photos-d-1440.png', width: 1440, height: 900 },
}

export type FilmTexts = Readonly<Record<string, string>>

export function Film({
  demo,
  still = false,
}: {
  demo: DemoKey
  labels: FrameLabels
  /** This film's words in the page's language, by key (`site.filmTexts`). */
  texts: FilmTexts
  still?: boolean
}) {
  const poster = stills[demo]
  if (!poster)
    return (
      <div
        className="film"
        data-demo={demo}
        style={{ aspectRatio: still ? undefined : '16 / 9' }}
      />
    )
  return (
    <div className={still ? 'film-still' : 'film'} data-demo={demo}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static still of the film */}
      <img
        className="film-still"
        src={poster.src}
        alt=""
        width={poster.width}
        height={poster.height}
      />
    </div>
  )
}
