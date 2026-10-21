'use client'

import type React from 'react'

import { ease } from './easing'
import type { FilmModule, StageProps } from './types'
import { type Cut, useVideoSync } from './video-sync'

/**
 * Film 3 · the photos of a sale, sorted by lot. A real capture of Nexcan's own
 * demo D (invented lots 41 to 46), in four cuts: the labels found in the
 * jumble, the bands by lot, the main photo proposed with lot 46's touch-up, the
 * doubtful label settled and the sorting confirmed by the firm.
 */
const duration = 10
const cuts: readonly Cut[] = [
  { video: 'd', at: 0, length: 2, from: 2, rate: 2 },
  { video: 'd', at: 2, length: 2.5, from: 8.2, rate: 1.6 },
  { video: 'd', at: 4.5, length: 2.5, from: 13.2, rate: 2.6 },
  { video: 'd', at: 7, length: 3, from: 20.6, rate: 2.2 },
]

/**
 * The phone capture: 338 × 958 px; its demo is drawn from 0 to 900, the
 * prototype's own footer and controls below, which the stage covers.
 */
const PHONE = { width: 338, height: 958, demo: 900 }
/** Where, in the phone capture, each moment happens (px from its top). */
const MARK = { bands: 665, touchUp: 845, settled: 150, validate: 958 }

const height = (width: number) => Math.round(width < 600 ? width * 1.45 : width / 1.691)

/** Ease from `a` to `b` while `t` runs from `t0` to `t1`. */
const pan = (t: number, t0: number, t1: number, a: number, b: number) =>
  a + (b - a) * ease(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))))

/**
 * On a phone the capture is taller than the stage: the stage is a window that
 * follows the action down the capture. `view` is the window's height, in px of
 * the capture.
 */
export const phoneTop = (t: number, view: number): number => {
  const last = Math.max(0, PHONE.height - view)
  const at = (y: number) => Math.min(last, Math.max(0, y))
  const bands = at(MARK.bands - view)
  const touchUp = at(MARK.touchUp - view)
  const settled = at(MARK.settled)
  const validate = at(MARK.validate - view)
  if (t < 2) return 0
  if (t < 4.5) return pan(t, 2, 4.5, 0, bands)
  if (t < 7) return pan(t, 4.5, 5.1, bands, touchUp)
  if (t < 8.6) return pan(t, 7, 7.5, touchUp, settled)
  return pan(t, 8.6, 9.6, settled, validate)
}

function Stage({ t, playing, width, height: H, texts }: StageProps) {
  const { bind, onLoaded } = useVideoSync(cuts, t, playing)
  const narrow = width < 600
  let box: React.CSSProperties
  let footer: number | null = null
  if (!narrow) {
    box = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }
  } else {
    const scale = width / PHONE.width
    const top = phoneTop(t, H / scale)
    box = {
      position: 'absolute',
      left: 0,
      top: -Math.round(top * scale),
      width: '100%',
      height: Math.round(PHONE.height * scale),
    }
    footer = Math.round((PHONE.demo - top) * scale)
  }
  const src = narrow ? '/films/photos-d-390' : '/films/photos-d-1440'
  const showStill = !playing && t >= duration
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#F6F5F0' }}>
      <video
        ref={bind('d')}
        src={`${src}.webm`}
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={onLoaded}
        style={box}
      />
      {showStill ? (
        // eslint-disable-next-line @next/next/no-img-element -- the last frame of a capture, at its own size
        <img
          src={`${src}.webp`}
          alt={texts.stillAlt ?? ''}
          width={narrow ? PHONE.width : 1248}
          height={narrow ? PHONE.height : 738}
          style={{ ...box, background: '#F6F5F0' }}
        />
      ) : null}
      {footer != null && footer < H ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: footer,
            bottom: 0,
            background: '#F6F5F0',
          }}
        />
      ) : null}
    </div>
  )
}

export const film: FilmModule = {
  duration,
  plans: [
    [0, 2],
    [2, 2.5],
    [4.5, 2.5],
    [7, 3],
  ],
  height,
  Stage,
}
