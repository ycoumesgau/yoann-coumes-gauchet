import type React from 'react'

import type { FilmTexts } from './film'

/** What the film shell gives a film's stage on every frame. */
export type StageProps = {
  /** Seconds since the start, from 0 to `duration`; `duration` is the last frame (the poster). */
  t: number
  playing: boolean
  /** The stage's width in CSS pixels; under 600 the film draws its narrow layout. */
  width: number
  /**
   * The stage's height: what `height(width)` asks for, cut on a phone to fit the
   * screen (`fit.ts`). A film lays itself out in it.
   */
  height: number
  texts: FilmTexts
}

/**
 * One film: a stage drawn as a pure function of time, plus its timing. The
 * shell (`film.tsx`) owns the clock, the controls, the poster and the
 * reduced-motion rule; a film owns only what is drawn.
 */
export type FilmModule = {
  duration: number
  /** The film's shots, as [start, length] in seconds; the shell shows one segment each. */
  plans: readonly (readonly [number, number])[]
  /** The stage height a film asks for at a width; on a phone it may get less. */
  height: (width: number) => number
  Stage: (props: StageProps) => React.ReactNode
}
