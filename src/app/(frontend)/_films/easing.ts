import type React from 'react'

/** Shared timing curves of the films (ported from the prototype's clock). */
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

/** Ease-out cubic. */
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3)

/** Smoothstep. */
export const sstep = (x: number) => {
  const c = clamp01(x)
  return c * c * (3 - 2 * c)
}

/** In over 0.35 s from `a`, out over 0.35 s from `b`. */
export const fade = (t: number, a: number, b: number) =>
  sstep((t - a) / 0.35) * (1 - sstep((t - b) / 0.35))

/** A seeded generator (mulberry32): the same layout on the server and in the browser. */
export const seeded = (seed: number) => {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const chipBase: React.CSSProperties = {
  position: 'absolute',
  fontFamily: 'var(--sans)',
  fontSize: '15px',
  lineHeight: '20px',
  fontWeight: 500,
  color: '#FFFFFF',
  background: '#151515',
  borderRadius: '4px',
  padding: '8px 12px',
  transition: 'opacity .3s, transform .3s',
}

/** The dark overlay chip laid over a real capture. */
export const chip = (on: boolean, pos: React.CSSProperties): React.CSSProperties => ({
  ...chipBase,
  opacity: on ? 1 : 0,
  transform: on ? 'translateY(0)' : 'translateY(6px)',
  ...pos,
})
