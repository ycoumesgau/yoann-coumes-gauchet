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

function Stage({ t: rawT, width: w, height: H, texts }: StageProps): React.ReactNode {
  const t = Math.max(0, Math.min(rawT, duration))
  const vert = w < 600
  const pad = vert ? 16 : 28

  type Box = { x: number; y: number; w: number; h?: number }
  // Wide: five boxes placed on the stage. Narrow: one column from the top, the
  // shipped list and the rules side by side at its foot.
  const A: Box = {
    x: pad,
    y: 96,
    w: Math.round(w * 0.31),
    h: vert ? 128 : 150,
  }
  const Bc: Box = {
    x: Math.round(w * 0.36),
    y: 96,
    w: Math.round(w * 0.29),
    h: vert ? 92 : 110,
  }
  const C: Box = { x: Math.round(w * 0.36), y: 222, w: 0 }
  const S: Box = { x: Math.round(w * 0.7), y: 96, w: Math.round(w * 0.27) }
  const Ru: Box = { x: Math.round(w * 0.7), y: 250, w: Math.round(w * 0.27) }
  // A phone screen too short for the whole column: the review and the check
  // give way to the shipped list and the rules when the change ships.
  const tight = vert && H < TIGHT
  const giveWay = tight ? sstep((t - 7.8) / 0.45) : 0
  const place = (P: Box): React.CSSProperties =>
    vert
      ? { position: 'relative' }
      : {
          position: 'absolute',
          left: `${P.x}px`,
          top: `${P.y}px`,
          width: P.w ? `${P.w}px` : undefined,
        }

  const card: React.CSSProperties = {
    position: 'absolute',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: tight ? '6px' : '8px',
    padding: tight ? '11px 12px' : '14px',
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
    ...place(P),
    minWidth: 0,
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

  const shippedList = (
    <div style={column(S, tight ? 7.8 : 0.6)}>
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
            maxHeight: `${(shipped * 88).toFixed(0)}px`,
            overflow: 'hidden',
            opacity: shipped,
          }}
        >
          {texts['change.title']}
        </span>
      ) : null}
      <span style={placeholder} />
      {tight ? null : <span style={placeholder} />}
    </div>
  )
  const rules = (
    <div style={column(Ru, tight ? 7.8 : 0.6)}>
      {show('rules', smallLabel)}
      <span style={bar('86%')} />
      {tight ? null : <span style={bar('70%')} />}
      {tight ? null : <span style={bar('78%')} />}
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
  )
  const change = (
    <div
      style={{
        ...card,
        ...(vert
          ? { position: 'relative' }
          : {
              left: 0,
              top: 0,
              width: `${A.w}px`,
              transformOrigin: '0 0',
              transform: `translate(${A.x}px,${A.y}px)`,
            }),
        minHeight: tight ? undefined : `${A.h}px`,
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
  )
  const review = (
    <div
      style={{
        ...card,
        ...place(Bc),
        minHeight: tight ? undefined : `${Bc.h}px`,
        opacity: sstep((t - 2.0) / 0.4),
        transform: `translateY(${((1 - sstep((t - 2) / 0.4)) * 8).toFixed(1)}px)`,
        borderStyle: 'dashed',
      }}
    >
      {show('review', smallLabel)}
      {show('review.case', {
        ...reveal(2.6, 0.9),
        color: 'var(--anom)',
        fontWeight: 600,
      })}
    </div>
  )
  const check = (
    <div
      style={{
        ...place(C),
        alignSelf: 'flex-start',
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
  )

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
      {vert ? (
        <div
          style={{
            position: 'absolute',
            left: `${pad}px`,
            right: `${pad}px`,
            top: '92px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {change}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: tight ? `${((1 - giveWay) * 320).toFixed(0)}px` : undefined,
              marginBottom: `${(-12 * giveWay).toFixed(1)}px`,
              opacity: 1 - giveWay,
              overflow: tight ? 'hidden' : undefined,
            }}
          >
            {review}
            {check}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {shippedList}
            {rules}
          </div>
        </div>
      ) : (
        <>
          {shippedList}
          {rules}
          {change}
          {review}
          {check}
        </>
      )}
    </div>
  )
}

/** Under this stage height, a phone cannot show the whole column at once. */
const TIGHT = 680

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
