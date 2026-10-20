'use client'

import type React from 'react'

import { chip } from './easing'
import type { FilmModule, StageProps } from './types'
import { type Cut, useVideoSync } from './video-sync'

/**
 * Film 2 · the asset-freeze register. A real capture of Nexcan's own demo C
 * (invented names), in three cuts: the buyers checked line by line, a partial
 * match rising to the top, the side-by-side review left to the firm.
 */
const duration = 8
const cuts: readonly Cut[] = [
  { video: 'c', at: 0, length: 2, from: 8, rate: 1.75 },
  { video: 'c', at: 2, length: 3, from: 11.8, rate: 1.67 },
  { video: 'c', at: 5, length: 3, from: 25, rate: 1.5 },
]

const height = (width: number) => Math.round(width < 600 ? width * 1.3 : width / 1.691)

function Stage({ t, playing, width, texts }: StageProps) {
  const { bind, onLoaded } = useVideoSync(cuts, t, playing)
  const narrow = width < 600
  const H = height(width)
  let vSt: React.CSSProperties
  let chipPos: React.CSSProperties
  if (!narrow) {
    vSt = {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    }
    chipPos = { left: 24, bottom: Math.round(H * 0.11) }
  } else {
    const vh = Math.round(width / 1.691)
    const top = Math.round(H * 0.14)
    vSt = { position: 'absolute', left: 0, top, width: '100%', height: vh, objectFit: 'contain' }
    chipPos = { left: 16, right: 16, top: top + vh + 24 }
  }
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F6F5F0' }}>
      <video
        ref={bind('c')}
        src="/films/lcbft-c-1440.webm"
        poster="/films/lcbft-c-1440.png"
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={onLoaded}
        style={vSt}
      />
      {texts.chip1 ? <div style={chip(t >= 2.4 && t < 5, chipPos)}>{texts.chip1}</div> : null}
      {texts.chip2 ? <div style={chip(t >= 5.4, chipPos)}>{texts.chip2}</div> : null}
    </div>
  )
}

export const film: FilmModule = {
  duration,
  plans: [
    [0, 2],
    [2, 3],
    [5, 3],
  ],
  height,
  Stage,
}
