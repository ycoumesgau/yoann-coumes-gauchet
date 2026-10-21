'use client'

import type React from 'react'

import { chip } from './easing'
import type { FilmModule, StageProps } from './types'
import { type Cut, cutAt, useVideoSync } from './video-sync'

/**
 * Film 1 · from the handwritten sheet to the signed report. Real captures of
 * Nexcan's own demo (invented case): shots 1 to 3 from film B, shot 4 from
 * the phone signature; the last frame is the signed report.
 */
const duration = 10
const cuts: readonly Cut[] = [
  { video: 'b', at: 0, length: 2, from: 3.6, rate: 1 },
  { video: 'b', at: 2, length: 3, from: 11, rate: 1 },
  { video: 'b', at: 5, length: 2, from: 22.4, rate: 2 },
  { video: 's', at: 7, length: 3, from: 4.0, rate: 2.1 },
]

/** While film B plays, the signature waits on its first useful frame. */
const prepare = (videos: Readonly<Record<string, HTMLVideoElement | null>>, cut: Cut) => {
  const s = videos.s
  if (cut.video === 'b' && s && Math.abs(s.currentTime - 4) > 0.3) {
    try {
      s.currentTime = 4
    } catch {
      // not seekable yet
    }
  }
}

const height = (width: number) => Math.round(width < 600 ? width * 1.5 : width / 1.5257)

function Stage({ t, playing, width, height: H, texts }: StageProps) {
  const { bind, onLoaded } = useVideoSync(cuts, t, playing, prepare)
  const narrow = width < 600
  const onB = cutAt(cuts, t).video === 'b'
  const fadeT = 'opacity .35s ease'
  let bSt: React.CSSProperties
  let sWrap: React.CSSProperties
  let sVid: React.CSSProperties
  let chipPos: React.CSSProperties
  if (!narrow) {
    bSt = {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    }
    const sc = (0.9 * H) / 460
    const vw = Math.round(390 * sc)
    sWrap = {
      position: 'absolute',
      left: '50%',
      top: Math.round(H * 0.05),
      width: vw,
      height: Math.round(460 * sc),
      marginLeft: -Math.round(vw / 2),
      overflow: 'hidden',
    }
    sVid = {
      position: 'absolute',
      left: 0,
      top: -Math.round(440 * sc),
      width: vw,
      height: Math.round(964 * sc),
    }
    chipPos = { left: 24, bottom: 78 }
  } else {
    const bh = Math.round(width / 1.5257)
    const top = Math.round(H * 0.18)
    bSt = { position: 'absolute', left: 0, top, width: '100%', height: bh, objectFit: 'contain' }
    const sc = width / 390
    const ch = Math.round(460 * sc)
    sWrap = {
      position: 'absolute',
      left: 0,
      top: Math.round((H - ch) / 2),
      width: '100%',
      height: ch,
      overflow: 'hidden',
    }
    sVid = {
      position: 'absolute',
      left: 0,
      top: -Math.round(440 * sc),
      width: '100%',
      height: Math.round(964 * sc),
    }
    chipPos = { left: 16, right: 16, top: top + bh + 20 }
  }
  const showStill = !playing && t >= duration
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F6F5F0' }}>
      <video
        ref={bind('b')}
        src="/films/demo-b-1440.webm"
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={onLoaded}
        style={{ ...bSt, opacity: onB ? 1 : 0, transition: fadeT }}
      />
      <div style={{ ...sWrap, opacity: onB ? 0 : 1, transition: fadeT }}>
        <video
          ref={bind('s')}
          src="/films/signature-390.webm"
          muted
          playsInline
          preload="metadata"
          onLoadedMetadata={onLoaded}
          style={sVid}
        />
      </div>
      {texts.chip1 ? <div style={chip(t >= 5 && t < 7.1, chipPos)}>{texts.chip1}</div> : null}
      {showStill ? (
        // eslint-disable-next-line @next/next/no-img-element -- the last frame of a capture, at its own size
        <img
          src={narrow ? '/films/signature-390.png' : '/films/signature-1440.png'}
          alt={texts.stillAlt ?? ''}
          width={narrow ? 390 : 1440}
          height={narrow ? 966 : 686}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
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
    [2, 3],
    [5, 2],
    [7, 3],
  ],
  height,
  Stage,
}
