'use client'

import type React from 'react'

import type { FilmModule, StageProps } from './types'

/**
 * Film 5 · write, break, fix, ship. An agent writes a change; a second one,
 * which has not seen the first one's reasoning, finds a case that breaks it
 * and a check turns red; the fix turns it green; the change ships and the
 * lesson becomes a written rule. An invented example; every word comes from
 * `texts`.
 */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const sstep = (x: number) => {
  const c = clamp01(x)
  return c * c * (3 - 2 * c)
}
const fade = (t: number, a: number, b: number) =>
  sstep((t - a) / 0.35) * (1 - sstep((t - b) / 0.35))

const ok = 'var(--ok, #1E7338)'
const okSoft = 'var(--ok-soft, #E2F0E5)'

const duration = 10

/** The four captions: [key, from, until]. */
const captions: readonly (readonly [string, number, number])[] = [
  ['caption.1', 0.1, 1.9],
  ['caption.2', 2.0, 4.9],
  ['caption.3', 5.0, 7.9],
  ['caption.4', 8.0, 99],
]

const smallLabel: React.CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: '11px',
  color: 'var(--mut)',
}

function Stage({ t: rawT, width: w, texts }: StageProps): React.ReactNode {
  const t = Math.max(0, Math.min(rawT, duration))
  const vert = w < 600
  const H = height(w)
  const pad = vert ? 16 : 28

  type Box = { x: number; y: number; w: number; h?: number }
  let A: Box, Bc: Box, C: Box, S: Box, Ru: Box
  if (!vert) {
    A = { x: pad, y: 96, w: Math.round(w * 0.31), h: 150 }
    Bc = { x: Math.round(w * 0.36), y: 96, w: Math.round(w * 0.29), h: 110 }
    C = { x: Math.round(w * 0.36), y: 222, w: 0 }
    S = { x: Math.round(w * 0.7), y: 96, w: Math.round(w * 0.27) }
    Ru = { x: Math.round(w * 0.7), y: 250, w: Math.round(w * 0.27) }
  } else {
    A = { x: pad, y: 92, w: w - pad * 2, h: 128 }
    Bc = { x: pad, y: 232, w: w - pad * 2, h: 92 }
    C = { x: pad, y: 336, w: 0 }
    S = { x: pad, y: Math.round(H * 0.6), w: w - pad * 2 }
    Ru = { x: pad, y: Math.round(H * 0.6) + 176, w: w - pad * 2 }
  }

  const card: React.CSSProperties = {
    position: 'absolute',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '14px',
    background: 'var(--surf)',
    border: '1px solid var(--line)',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,.06)',
  }
  const reveal = (a: number, d: number): React.CSSProperties => ({
    fontSize: '15px',
    lineHeight: '20px',
    color: 'var(--ink)',
    clipPath: `inset(0 ${(100 - clamp01((t - a) / d) * 100).toFixed(1)}% 0 0)`,
  })
  const red = t >= 3.4 && t < 6.0
  const green = t >= 6.0
  const column = (P: Box, at: number): React.CSSProperties => ({
    position: 'absolute',
    left: `${P.x}px`,
    top: `${P.y}px`,
    width: `${P.w}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    opacity: sstep((t - at) / 0.4),
  })
  const shipped = sstep((t - 8.0) / 0.45)
  const ruleIn = sstep((t - 8.7) / 0.4)
  const verdict = red ? texts['fails'] : green ? texts['passes'] : '…'
  const placeholder: React.CSSProperties = {
    height: '30px',
    border: '1px solid var(--line)',
    borderRadius: '5px',
    background: 'var(--surf)',
  }
  const bar = (width: string): React.CSSProperties => ({
    height: '8px',
    width,
    background: 'var(--surf2)',
    borderRadius: '2px',
  })
  const show = (key: string, style: React.CSSProperties) =>
    texts[key] ? <span style={style}>{texts[key]}</span> : null

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {captions.map(([key, a, b]) =>
        texts[key] ? (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: `${pad}px`,
              right: `${pad}px`,
              top: '22px',
              fontFamily: 'var(--serif)',
              fontSize: '26px',
              lineHeight: '32px',
              fontWeight: 400,
              color: 'var(--ink)',
              opacity: fade(t, a, b),
              transform: `translateY(${((1 - sstep((t - a) / 0.35)) * 6).toFixed(1)}px)`,
            }}
          >
            {texts[key]}
          </div>
        ) : null,
      )}
      <div style={column(S, 0.6)}>
        {show('shipped', smallLabel)}
        {texts['change.title'] ? (
          <span
            style={{
              display: 'block',
              boxSizing: 'border-box',
              fontSize: '13px',
              lineHeight: '17px',
              fontWeight: 600,
              color: 'var(--ink)',
              background: okSoft,
              border: shipped > 0.01 ? `1px solid ${ok}` : '0',
              borderRadius: '5px',
              padding: shipped > 0.01 ? '6px 10px' : '0 10px',
              maxHeight: `${(shipped * 64).toFixed(0)}px`,
              overflow: 'hidden',
              opacity: shipped,
            }}
          >
            {texts['change.title']}
          </span>
        ) : null}
        <span style={placeholder} />
        <span style={placeholder} />
      </div>
      <div style={column(Ru, 0.6)}>
        {show('rules', smallLabel)}
        <span style={bar('86%')} />
        <span style={bar('70%')} />
        <span style={bar('78%')} />
        {show('rule.new', {
          fontSize: '14px',
          lineHeight: '19px',
          fontWeight: 600,
          color: 'var(--ink)',
          background: 'var(--acc-soft)',
          borderLeft: '3px solid var(--acc)',
          padding: '6px 8px',
          opacity: ruleIn,
          transform: `translateY(${((1 - ruleIn) * 6).toFixed(1)}px)`,
        })}
      </div>
      <div
        style={{
          ...card,
          left: 0,
          top: 0,
          width: `${A.w}px`,
          minHeight: `${A.h}px`,
          transformOrigin: '0 0',
          transform: `translate(${A.x}px,${A.y}px)`,
          opacity: sstep(t / 0.4),
          zIndex: 2,
        }}
      >
        {show('change', smallLabel)}
        {show('change.title', reveal(0.3, 1.4))}
        {show('change.fix', {
          ...reveal(5.2, 0.8),
          color: ok,
          fontWeight: 600,
          fontSize: '14px',
        })}
      </div>
      <div
        style={{
          ...card,
          left: `${Bc.x}px`,
          top: `${Bc.y}px`,
          width: `${Bc.w}px`,
          minHeight: `${Bc.h}px`,
          opacity: sstep((t - 2.0) / 0.4),
          transform: `translateY(${((1 - sstep((t - 2) / 0.4)) * 8).toFixed(1)}px)`,
          borderStyle: 'dashed',
        }}
      >
        {show('review', smallLabel)}
        {show('review.case', { ...reveal(2.6, 0.9), color: 'var(--anom)', fontWeight: 600 })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: `${C.x}px`,
          top: `${C.y}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: 'var(--ink)',
          padding: '6px 10px',
          borderRadius: '999px',
          border: `1px solid ${red ? 'var(--anom)' : green ? ok : 'var(--line)'}`,
          background: red ? 'var(--anom-soft)' : green ? okSoft : 'var(--surf)',
          opacity: sstep((t - 3.0) / 0.3),
          transition: 'background .3s, border-color .3s',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: red ? 'var(--anom)' : green ? ok : 'var(--mut)',
            flex: 'none',
          }}
        />
        {texts['check'] ? <span>{texts['check']}</span> : null}
        {verdict ? (
          <span
            style={{
              fontWeight: 600,
              color: red ? 'var(--anom)' : green ? ok : 'var(--mut)',
            }}
          >
            {verdict}
          </span>
        ) : null}
      </div>
    </div>
  )
}

const height = (width: number) => Math.round(width * (width < 600 ? 1.75 : 0.5))

export const film: FilmModule = {
  duration,
  plans: [
    [0, 2],
    [2, 3],
    [5, 3],
    [8, 2],
  ],
  height,
  Stage,
}
