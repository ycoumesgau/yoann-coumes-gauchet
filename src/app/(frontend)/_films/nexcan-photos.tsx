'use client'

import type React from 'react'

import { clamp01, ease, seeded, sstep } from './easing'
import type { FilmModule, StageProps } from './types'

/**
 * Film 3 · a batch sorted, one photo to review. The photos are the invented
 * ones of Nexcan's demo D (`ph-sprite.png`, 12 × 2 cells); only the count,
 * 174 photos and one to review, comes from Yoann's own test.
 */
const duration = 8
const total = 174
/** Photos per lot: twelve lots, 173 photos; the 174th stands apart. */
const counts = [16, 14, 15, 13, 15, 14, 16, 12, 15, 14, 15, 14]
const groups = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16, 17],
  [18, 19, 20],
  [21, 22, 23],
]
const firstLot = 41

const height = (width: number) => Math.round(width < 600 ? width * 2 : width * 0.62)

type Tile = {
  /** Lot index, or -1 for the photo set apart. */
  k: number
  sx: number
  sy: number
  cell: number
  ord: number
  px: number
  py: number
  rot: number
  a: number
  s: number
}

type Layout = {
  tiles: Tile[]
  tw: number
  th: number
  lots: { x: number; y: number }[]
  box: { x: number; y: number }
  pad: number
}

const layouts = new Map<string, Layout>()

/** Where each photo falls and where it lands; seeded, so the server and the browser agree. */
function layout(w: number, H: number, narrow: boolean): Layout {
  const key = `${w}x${H}${narrow}`
  const cached = layouts.get(key)
  if (cached) return cached
  const R = seeded(7)
  const pad = narrow ? 16 : 28
  const headH = narrow ? 64 : 58
  const gap = narrow ? 3 : 4
  let tw: number
  let th: number
  let slot: (k: number, j: number) => [number, number]
  const lots: { x: number; y: number }[] = []
  if (!narrow) {
    const labW = 50
    const aw = w - pad * 2 - labW
    tw = Math.floor((aw - 15 * gap) / 16)
    th = Math.round(tw * 0.565)
    const rowH = Math.max(th + 6, Math.floor((H - headH - pad) / 12))
    if (th > rowH - 6) {
      th = rowH - 6
      tw = Math.round(th / 0.565)
    }
    const tW = tw
    slot = (k, j) => [pad + labW + j * (tW + gap), headH + k * rowH]
    counts.forEach((_, k) => lots.push({ x: pad, y: headH + k * rowH + th / 2 - 7 }))
  } else {
    const cols = 4
    const colW = (w - pad * 2) / cols
    const labH = 18
    tw = Math.floor((colW - 10 - gap) / 2)
    th = Math.round(tw * 0.565)
    const stripH = 8 * (th + gap)
    const blockH = stripH + labH + 10
    const tW = tw
    const tH = th
    slot = (k, j) => {
      const c = k % cols
      const r = Math.floor(k / cols)
      return [
        pad + c * colW + (j % 2) * (tW + gap),
        headH + r * blockH + labH + Math.floor(j / 2) * (tH + gap),
      ]
    }
    counts.forEach((_, k) =>
      lots.push({ x: pad + (k % cols) * colW, y: headH + Math.floor(k / cols) * blockH }),
    )
  }
  const box = { x: w - pad - Math.round(tw * 1.5), y: Math.round((headH - th * 1.5) / 2) }
  const placed: Omit<Tile, 'px' | 'py' | 'rot' | 'a' | 's'>[] = []
  let i = 0
  counts.forEach((c, k) => {
    const g = groups[k % 6]!
    for (let j = 0; j < c; j++) {
      const [sx, sy] = slot(k, j)
      placed.push({ k, sx, sy, cell: g[(j + k) % g.length]!, ord: i++ })
    }
  })
  placed.splice(60, 0, { k: -1, sx: box.x, sy: box.y, cell: 22, ord: -1 })
  const tiles = placed.map((tl) => {
    const px = w * (narrow ? 0.12 + 0.76 * R() : 0.3 + 0.4 * R()) - tw / 2
    const py = H * (narrow ? 0.22 + 0.55 * R() : 0.25 + 0.5 * R()) - th / 2
    const rot = (R() - 0.5) * 50
    const a = R() * 1.6
    const s = tl.k < 0 ? 6.0 : 2 + (tl.ord / 173) * 3.1
    return { ...tl, px, py, rot, a, s }
  })
  const out = { tiles, tw, th, lots, box, pad }
  layouts.set(key, out)
  return out
}

function Stage({ t, width, texts }: StageProps) {
  const narrow = width < 600
  const H = height(width)
  const { tiles, tw, th, lots, box, pad } = layout(width, H, narrow)
  let sorted = 0
  const photos = tiles.map((tl, i) => {
    const q = clamp01((t - tl.a) / 0.3)
    const m = ease((t - tl.s) / (tl.k < 0 ? 0.7 : 0.8))
    if (tl.k >= 0 && m >= 1) sorted++
    const big = tl.k < 0 ? 1 + 0.5 * m : 1
    const x = tl.px + (tl.sx - tl.px) * m
    const y = tl.py + (tl.sy - tl.py) * m
    const r = tl.rot * (1 - m)
    const sc = (1.25 - 0.25 * q) * big
    const style: React.CSSProperties = {
      position: 'absolute',
      left: 0,
      top: 0,
      width: tw,
      height: th,
      transformOrigin: '0 0',
      transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${r.toFixed(1)}deg) scale(${sc.toFixed(3)})`,
      backgroundImage: 'url(/films/ph-sprite.png)',
      backgroundSize: `${12 * tw}px ${2 * th}px`,
      backgroundPosition: `-${(tl.cell % 12) * tw}px -${Math.floor(tl.cell / 12) * th}px`,
      opacity: q,
      borderRadius: 2,
      boxShadow: m < 1 ? '0 1px 4px rgba(0,0,0,.28)' : 'none',
      outline: tl.k < 0 && t > 6.6 ? '2px solid var(--anom)' : 'none',
      outlineOffset: 2,
    }
    return <div key={i} style={style} />
  })
  const lotOp = sstep((t - 2) / 0.6)
  const rv = sstep((t - 6.5) / 0.4)
  const bw = Math.round(tw * 1.5)
  const bh = Math.round(th * 1.5)
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--surf)' }}>
      {texts.heading ? (
        <div
          style={{
            position: 'absolute',
            left: pad,
            top: narrow ? 20 : 16,
            fontFamily: 'var(--serif)',
            fontSize: narrow ? 22 : 26,
            lineHeight: '28px',
            color: 'var(--ink)',
            opacity: sstep(t / 0.4),
          }}
        >
          {texts.heading}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          // On a phone the review label needs the row: the counter goes under the heading.
          left: narrow ? pad : pad + 150,
          top: narrow ? 50 : 22,
          fontFamily: 'var(--mono)',
          fontSize: narrow ? 11 : 13,
          color: 'var(--ink2)',
          opacity: sstep((t - 2) / 0.4),
        }}
      >
        {sorted} / {total}
      </div>
      {texts.lot
        ? lots.map((l, k) => (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: l.x,
                top: l.y,
                fontFamily: 'var(--mono)',
                fontSize: 10,
                lineHeight: '14px',
                color: 'var(--mut)',
                opacity: lotOp,
              }}
            >
              {texts.lot} {firstLot + k}
            </div>
          ))
        : null}
      <div
        style={{
          position: 'absolute',
          left: box.x - 4,
          top: box.y - 4,
          width: bw + 8,
          height: bh + 8,
          border: '1px dashed var(--line)',
          borderRadius: 3,
          opacity: sstep((t - 5.6) / 0.4),
        }}
      />
      {texts.review ? (
        <div
          style={{
            position: 'absolute',
            right: pad + bw + 16,
            top: box.y + bh / 2 - 10,
            fontFamily: 'var(--sans)',
            fontSize: 15,
            fontWeight: 600,
            lineHeight: '20px',
            color: 'var(--anom)',
            opacity: rv,
            whiteSpace: 'nowrap',
          }}
        >
          {texts.review}
        </div>
      ) : null}
      {photos}
    </div>
  )
}

export const film: FilmModule = {
  duration,
  plans: [
    [0, 2],
    [2, 4],
    [6, 2],
  ],
  height,
  Stage,
}
