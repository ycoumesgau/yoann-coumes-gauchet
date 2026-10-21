'use client'

import type { CSSProperties } from 'react'

import type { FilmModule, StageProps } from './types'

/**
 * Film 7: Fred, the accounting agent, runs the monthly close. The checklist
 * ticks itself, one receipt is missing, the verdict is "needs review", and the
 * proposed entry waits for the go. Invented data.
 */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const sstep = (x: number) => {
  const c = clamp01(x)
  return c * c * (3 - 2 * c)
}

const DURATION = 8

/** The checklist, in order; its words are `item.<key>`. */
const ITEMS = ['bank', 'receipts', 'intercompany', 'vat'] as const
/** When each line is ticked; the receipts line stays open. */
const DONE: readonly (number | null)[] = [2.0, null, 3.4, 4.2]
/** The open line, and when it shows what is missing. */
const OPEN = 1
const OPEN_AT = 2.6

function Stage({ t, width: w, height: H, texts }: StageProps) {
  const vert = w < 600
  const pad = vert ? 16 : 28
  // A phone screen too short for the stack: the lines tighten, and the missing
  // receipt folds away as the entry that settles it arrives.
  const tight = vert && H < TIGHT

  const row = (k: number): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '16px',
    lineHeight: '22px',
    color: 'var(--ink)',
    padding: tight ? '9px 0' : '12px 0',
    borderTop: '1px solid var(--line)',
    opacity: sstep((t - 0.1 - k * 0.2) / 0.3),
  })
  const isDone = (k: number) => DONE[k] != null && t >= (DONE[k] as number)
  const isOpen = (k: number) => k === OPEN && t >= OPEN_AT
  const box = (k: number): CSSProperties => {
    const d = isDone(k)
    return {
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      flex: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      fontWeight: 700,
      boxSizing: 'border-box',
      background: d ? 'var(--ink)' : 'transparent',
      color: d ? 'var(--bg)' : 'var(--anom)',
      border: d ? 'none' : '1.5px solid ' + (isOpen(k) ? 'var(--anom)' : 'var(--mut)'),
    }
  }
  // Signs, not words: a tick for a done line, "!" for the open one.
  const mark = (k: number) => (isDone(k) ? '✓' : isOpen(k) ? '!' : '')

  // folds away, on a short phone screen, as the entry arrives
  const fold = tight ? 1 - sstep((t - 6.6) / 0.4) : 1
  const dOp = sstep((t - OPEN_AT) / 0.4) * fold
  const missing: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: 'var(--mono)',
    fontSize: '13px',
    color: 'var(--ink)',
    background: 'var(--anom-soft)',
    borderRadius: '4px',
    padding: dOp > 0.01 ? '8px 10px' : '0 10px',
    margin: dOp > 0.01 ? '0 0 10px 32px' : '0 0 0 32px',
    maxHeight: (dOp * 40).toFixed(0) + 'px',
    overflow: 'hidden',
    opacity: dOp,
  }

  const right: CSSProperties = vert
    ? { left: pad + 'px', width: w - pad * 2 + 'px' }
    : { left: Math.round(w * 0.58) + 'px', width: Math.round(w * 0.38) + 'px' }
  // Wide, the verdict and the entry stand on the right; narrow, they follow the list.
  const at = (top: number): CSSProperties =>
    vert ? { position: 'relative' } : { position: 'absolute', top: top + 'px', ...right }
  const vo = sstep((t - 5.0) / 0.4)
  const verdictOn = t >= 5.4
  const pill = (on: boolean): CSSProperties => ({
    fontFamily: 'var(--sans)',
    fontSize: vert ? '13px' : '15px',
    fontWeight: on ? 700 : 500,
    padding: vert ? '5px 7px' : '8px 14px',
    borderRadius: '999px',
    border: '1px solid ' + (on ? 'var(--ink)' : 'var(--line)'),
    background: on ? 'var(--ink)' : 'var(--surf)',
    color: on ? 'var(--bg)' : 'var(--mut)',
    transition: 'all .3s',
  })
  const eo = sstep((t - 6.6) / 0.4)
  const pulse = t >= 7.2 ? 0.5 + 0.5 * Math.sin(t * 6) : 0

  const line = (k: number) => (
    <div style={row(k)}>
      <span style={box(k)} aria-hidden="true">
        {mark(k)}
      </span>
      <span>{texts[`item.${ITEMS[k]}`]}</span>
    </div>
  )

  const list = (
    <div
      style={{
        ...(vert
          ? {}
          : {
              position: 'absolute',
              left: pad + 'px',
              top: '24px',
              width: Math.round(w * 0.5) + 'px',
            }),
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--serif)',
          fontSize: '24px',
          lineHeight: '30px',
          color: 'var(--ink)',
          padding: '0 0 10px',
          maxHeight: (fold * 70).toFixed(0) + 'px',
          overflow: 'hidden',
          opacity: fold,
        }}
      >
        {texts.title}
      </span>
      {line(0)}
      {line(1)}
      <div style={missing}>
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--anom)',
            flex: 'none',
          }}
        />
        <span>{texts.expense}</span>
      </div>
      {line(2)}
      {line(3)}
    </div>
  )
  const verdict = (
    <div
      style={{
        ...at(70),
        display: 'flex',
        flexWrap: 'wrap',
        gap: vert ? '5px' : '8px',
        opacity: vo,
      }}
    >
      <span style={pill(false)}>{texts['verdict.ready']}</span>
      <span style={pill(verdictOn)}>{texts['verdict.review']}</span>
      <span style={pill(false)}>{texts['verdict.notReady']}</span>
    </div>
  )
  const entry = (
    <div
      style={{
        ...at(Math.round(H * 0.42)),
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: tight ? '8px' : '10px',
        padding: tight ? '12px' : '16px',
        background: 'var(--surf)',
        border: '1px solid var(--line)',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,.08)',
        opacity: eo,
        transform: `translateY(${((1 - eo) * 10).toFixed(1)}px)`,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--mut)',
        }}
      >
        {texts['entry.label']}
      </span>
      <span style={{ fontSize: '15px', lineHeight: '20px', color: 'var(--ink)' }}>
        {texts.expense}
      </span>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: tight ? 'nowrap' : 'wrap',
        }}
      >
        {texts.go ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px',
              minWidth: '64px',
              flex: 'none',
              padding: '0 18px',
              borderRadius: '999px',
              background: 'var(--acc)',
              color: '#141414',
              fontWeight: 700,
              fontSize: '15px',
              boxShadow: `0 0 0 ${(pulse * 6).toFixed(1)}px var(--acc-soft)`,
            }}
          >
            {texts.go}
          </span>
        ) : null}
        <span
          style={{
            fontSize: tight ? '13px' : '14px',
            lineHeight: tight ? '17px' : '19px',
            color: 'var(--ink2)',
            opacity: sstep((t - 7.0) / 0.4),
          }}
        >
          {texts.say}
        </span>
      </span>
    </div>
  )

  return vert ? (
    <div
      style={{
        position: 'absolute',
        left: pad + 'px',
        right: pad + 'px',
        top: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {list}
      {verdict}
      {entry}
    </div>
  ) : (
    <>
      {list}
      {verdict}
      {entry}
    </>
  )
}

/** Under this stage height, a phone cannot show the whole stack at once. */
const TIGHT = 520

/** Wide: about half the width; narrow: the list, the verdict, then the entry, stacked. */
const height = (w: number): number => Math.round(w * (w < 600 ? 1.75 : 0.52))

export const film: FilmModule = {
  duration: DURATION,
  plans: [
    [0, 2],
    [2, 3],
    [5, 2],
    [7, 1],
  ],
  height,
  Stage,
}
