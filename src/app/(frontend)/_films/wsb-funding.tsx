'use client'

import type React from 'react'

import type { FilmTexts } from './film'
import type { FilmModule, StageProps } from './types'

/**
 * Film 8 · the WeShareBonds trajectory, from a blank page to €162M funded.
 * The curve passes through real, public data points (first loan, Nov 2017,
 * ≈ €50M to SMEs, the €162M total); between them it is drawn, a monotone
 * curve that never overshoots a point. Every word comes from `texts`.
 */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const sstep = (x: number) => {
  const c = clamp01(x)
  return c * c * (3 - 2 * c)
}
const fade = (t: number, a: number, b: number) =>
  sstep((t - a) / 0.35) * (1 - sstep((t - b) / 0.35))

/** The real points: [year as a decimal, € millions funded, cumulative]. */
const knots: readonly (readonly [number, number])[] = [
  [2015.5, 0],
  [2016.55, 0.2],
  [2017.85, 3.5],
  [2020.3, 50],
  [2023.3, 150],
  [2024.6, 162],
]
const total = 162
const firstYear = knots[0]![0]
const lastYear = knots[knots.length - 1]![0]
/** The end of SME lending, where the curve changes colour (real estate after). */
const pivotYear = 2020.3

/** Fritsch–Carlson tangents: a monotone cubic through the knots. */
const tangents = (() => {
  const n = knots.length
  const dx: number[] = []
  const slope: number[] = []
  const m: number[] = new Array(n).fill(0)
  for (let i = 0; i < n - 1; i++) {
    dx[i] = knots[i + 1]![0] - knots[i]![0]
    slope[i] = (knots[i + 1]![1] - knots[i]![1]) / dx[i]!
  }
  for (let i = 1; i < n - 1; i++)
    m[i] = slope[i - 1]! * slope[i]! <= 0 ? 0 : (slope[i - 1]! + slope[i]!) / 2
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = m[i + 1] = 0
      continue
    }
    const p = m[i]! / slope[i]!
    const q = m[i + 1]! / slope[i]!
    const h = p * p + q * q
    if (h > 9) {
      const tau = 3 / Math.sqrt(h)
      m[i] = tau * p * slope[i]!
      m[i + 1] = tau * q * slope[i]!
    }
  }
  return { dx, m }
})()

/** Cumulative € millions funded at a (decimal) year. */
export const wsbFunded = (year: number): number => {
  if (year <= firstYear) return 0
  if (year >= lastYear) return total
  let i = 0
  while (year > knots[i + 1]![0]) i++
  const h = tangents.dx[i]!
  const u = (year - knots[i]![0]) / h
  const u2 = u * u
  const u3 = u2 * u
  return (
    (2 * u3 - 3 * u2 + 1) * knots[i]![1] +
    (u3 - 2 * u2 + u) * h * tangents.m[i]! +
    (-2 * u3 + 3 * u2) * knots[i + 1]![1] +
    (u3 - u2) * h * tangents.m[i + 1]!
  )
}

type Frame = { L: number; R: number; T: number; B: number }

const scales = ({ L, R, T, B }: Frame) => ({
  X: (year: number) => L + ((year - 2015.3) / 10.1) * (R - L),
  Y: (value: number) => B - (value / 170) * (B - T),
})

const sample = (frame: Frame, a: number, b: number, perYear = 30): [number, number][] => {
  const { X, Y } = scales(frame)
  if (b <= a) return []
  const k = Math.max(2, Math.ceil((b - a) * perYear))
  const out: [number, number][] = []
  for (let j = 0; j <= k; j++) {
    const year = a + ((b - a) * j) / k
    out.push([X(year), Y(wsbFunded(year))])
  }
  return out
}
const toPath = (pts: [number, number][]) =>
  pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
const toArea = (pts: [number, number][], B: number) =>
  pts.length
    ? `${toPath(pts)} L${pts[pts.length - 1]![0].toFixed(1)} ${B} L${pts[0]![0].toFixed(1)} ${B} Z`
    : ''

/** The dots: the real points shown, with the time each one appears. */
const dotsAt: readonly (readonly [number, number])[] = [
  [2016.55, 3.6],
  [2017.85, 6.1],
  [2020.3, 9.2],
  [2024.6, 16.6],
]

/** The seven shots: [title key, part key, start, end]. */
const shots: readonly (readonly [string, string, number, number])[] = [
  ['title.1', 'part.1', 0, 2.5],
  ['title.2', 'part.2', 2.5, 5],
  ['title.3', 'part.3', 5, 7.5],
  ['title.4', 'part.4', 7.5, 10],
  ['title.5', 'part.5', 10, 12.5],
  ['title.6', 'part.6', 12.5, 15],
  ['title.7', 'part.7', 15, 18],
]

const tileKeys = [1, 2, 3, 4, 5, 6] as const

const duration = 21

function Stage({ t: rawT, width: w, texts }: StageProps): React.ReactNode {
  const t = Math.max(0, Math.min(rawT, duration))
  const vert = w < 600
  const H = height(w)
  const pad = vert ? 16 : 28
  const frame: Frame = {
    L: vert ? 20 : 44,
    R: w - (vert ? 16 : 32),
    T: vert ? 300 : 196,
    B: H - (vert ? 64 : 66),
  }
  const { L, R, T, B } = frame
  const { X, Y } = scales(frame)

  // How far the curve has been drawn, shot by shot.
  const stops: readonly (readonly [number, number, number])[] = [
    [2.5, 2015.5, 2016.75],
    [5, 2016.75, 2018.1],
    [7.5, 2018.1, 2020.3],
    [10, 2020.3, 2022.6],
    [12.5, 2022.6, 2023.9],
    [15, 2023.9, 2024.6],
  ]
  let drawn = firstYear
  for (const [at, a, b] of stops) if (t >= at) drawn = a + (b - a) * sstep((t - at) / 1.8)

  const smeArea = toArea(sample(frame, firstYear, Math.min(drawn, pivotYear)), B)
  const realEstateArea = drawn > pivotYear ? toArea(sample(frame, pivotYear, drawn), B) : ''
  const curve = toPath(sample(frame, firstYear, drawn))

  const years = vert
    ? [2016, 2020, 2024]
    : [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
  const op = (at: number, until?: number) =>
    sstep((t - at) / 0.35) * (until != null && vert ? 1 - sstep((t - until) / 0.35) : 1)

  const x2 = X(2016.55)
  const x3 = X(2017.85)
  const x4 = X(2020.3)
  const x7 = X(lastYear)

  const chip: React.CSSProperties = {
    position: 'absolute',
    fontFamily: 'var(--mono)',
    fontSize: vert ? '11px' : '11.5px',
    lineHeight: '15px',
    color: 'var(--ink)',
    background: 'var(--surf)',
    border: '1px solid var(--line)',
    borderRadius: '3px',
    padding: '3px 7px',
    maxWidth: vert ? '62%' : '230px',
    boxSizing: 'border-box',
  }
  type Pin = { key: string; style: React.CSSProperties }
  const pin = (
    key: string,
    x: number | null,
    y: number,
    opacity: number,
    extra: React.CSSProperties = {},
  ): Pin => ({
    key,
    style: {
      ...chip,
      ...(x == null ? {} : { left: `${x.toFixed(0)}px` }),
      top: `${y.toFixed(0)}px`,
      opacity,
      ...extra,
    },
  })
  const oneLine: React.CSSProperties = vert ? {} : { whiteSpace: 'nowrap', maxWidth: 'none' }
  const pins: Pin[] = [
    pin('point.firstLoan', x2 - 4, vert ? T + 10 : B - 128, op(3.7, 5), oneLine),
    pin('point.nov2017', x3 - 4, vert ? T + 10 : B - 76, op(6.2, 7.5), oneLine),
    pin('point.award', vert ? L : X(2016.9), vert ? T + 50 : B - 182, op(8.2, 10), {
      background: 'var(--acc-soft)',
      borderColor: 'var(--acc)',
    }),
    pin('point.sme', x4 + 10, Y(50) - (vert ? 34 : 12), op(9.3, 10), {
      whiteSpace: 'nowrap',
      maxWidth: 'none',
    }),
    pin('point.realEstate', vert ? L : X(2020.45), vert ? T + 10 : Y(150) - 6, op(11.4, 12.5), {
      maxWidth: vert ? '70%' : '200px',
    }),
    pin(
      'point.freeze',
      vert ? X(2023.3) : X(2023.3) + 10,
      vert ? Y(150) + 16 : Y(150) + 18,
      op(13.6, 15),
      { transform: vert ? 'translateX(-100%)' : 'none', whiteSpace: 'nowrap', maxWidth: 'none' },
    ),
    pin('point.funded', null, Y(total) - 30, op(16.6), {
      right: `${Math.max(0, w - x7 - 4).toFixed(0)}px`,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      maxWidth: 'none',
    }),
    pin('point.repayments', null, Y(total) + 10, op(17.1), {
      right: `${Math.max(0, w - R).toFixed(0)}px`,
      color: 'var(--ink2)',
      whiteSpace: 'nowrap',
      maxWidth: 'none',
    }),
  ]

  const leaders = vert
    ? []
    : [
        { d: `M${x2} ${B - 108} L${x2} ${Y(0.2) - 6}`, opacity: op(3.7) },
        { d: `M${x3} ${B - 56} L${x3} ${Y(3.5) - 6}`, opacity: op(6.2) },
      ]
  const tailOpacity = sstep((t - 16.8) / 0.6)

  const cols = vert ? 2 : 6
  const gap = 8
  const tw = (w - pad * 2 - gap * (cols - 1)) / cols
  const th = vert ? 76 : tw < 150 ? 108 : 92
  const tilesTop = vert ? 16 : 20
  const rows = Math.ceil(tileKeys.length / cols)
  const myPart = texts['myPart']

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg
        width={w}
        height={H}
        aria-hidden="true"
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
      >
        <path d={smeArea} style={{ fill: 'var(--surf2)' }} />
        <path d={realEstateArea} style={{ fill: 'var(--acc)' }} />
        <path
          d={`M${L} ${B} L${R} ${B}`}
          style={{ fill: 'none', stroke: 'var(--line)', strokeWidth: 1 }}
        />
        <path
          d={curve}
          style={{
            fill: 'none',
            stroke: 'var(--ink2)',
            strokeWidth: 1.5,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
          }}
        />
        <path
          d={`M${x7} ${Y(total)} L${R} ${Y(total)}`}
          style={{
            fill: 'none',
            stroke: 'var(--ink)',
            strokeWidth: 1.5,
            strokeDasharray: '3 5',
            opacity: tailOpacity,
          }}
        />
        {leaders.map((l) => (
          <path
            key={l.d}
            d={l.d}
            style={{ fill: 'none', stroke: 'var(--mut)', strokeWidth: 1, opacity: l.opacity }}
          />
        ))}
        {dotsAt.map(([year, at]) => (
          <circle
            key={year}
            cx={X(year)}
            cy={Y(wsbFunded(year))}
            r={5}
            style={{
              fill: 'var(--ink)',
              stroke: 'var(--surf)',
              strokeWidth: 2,
              opacity: sstep((t - at) / 0.3),
            }}
          />
        ))}
      </svg>
      {years.map((year) => (
        <div
          key={year}
          style={{
            position: 'absolute',
            left: `${X(year).toFixed(0)}px`,
            top: `${B + 8}px`,
            transform: 'translateX(-50%)',
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            lineHeight: '14px',
            color: 'var(--mut)',
          }}
        >
          {year}
        </div>
      ))}
      {pins.map(({ key, style }) =>
        texts[key] ? (
          <div key={key} data-key={key} style={style}>
            {texts[key]}
          </div>
        ) : null,
      )}
      {shots.map(([titleKey, partKey, a, b]) => {
        const title = texts[titleKey]
        const part = texts[partKey]
        if (!title && !part) return null
        return (
          <div
            key={titleKey}
            style={{
              position: 'absolute',
              left: `${pad}px`,
              right: `${pad}px`,
              top: `${vert ? 18 : 22}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: vert ? '10px' : '8px',
              opacity: fade(t, a + 0.05, b - 0.3),
              transform: `translateY(${((1 - sstep((t - a) / 0.35)) * 6).toFixed(1)}px)`,
            }}
          >
            {title ? (
              <span
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: vert ? '23px' : '30px',
                  lineHeight: vert ? '29px' : '36px',
                  color: 'var(--ink)',
                  textWrap: 'balance',
                }}
              >
                {title}
              </span>
            ) : null}
            {part ? (
              <span
                style={{
                  fontSize: vert ? '15px' : '16px',
                  lineHeight: vert ? '21px' : '22px',
                  color: 'var(--ink2)',
                  maxWidth: '44em',
                  textWrap: 'pretty',
                }}
              >
                {myPart ? (
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '11px',
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      color: 'var(--acc-ink)',
                      marginRight: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {myPart}
                  </span>
                ) : null}
                {part}
              </span>
            ) : null}
          </div>
        )
      })}
      {tileKeys.map((n, i) => {
        const value = texts[`tile.${n}.value`]
        const label = texts[`tile.${n}.label`]
        if (!value && !label) return null
        const o = sstep((t - 18.1 - i * 0.18) / 0.35)
        const lead = i === 0
        return (
          <div
            key={n}
            style={{
              position: 'absolute',
              left: `${(pad + (i % cols) * (tw + gap)).toFixed(0)}px`,
              top: `${tilesTop + Math.floor(i / cols) * (th + gap)}px`,
              width: `${tw.toFixed(0)}px`,
              height: `${th}px`,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: vert ? '10px 12px' : '12px 14px',
              background: lead ? 'var(--acc)' : 'var(--surf)',
              border: `1px solid ${lead ? 'var(--acc)' : 'var(--line)'}`,
              borderTop: '2px solid var(--ink)',
              borderRadius: '4px',
              opacity: o,
              transform: `translateY(${((1 - o) * 8).toFixed(1)}px)`,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--serif)',
                fontSize: `${vert ? (tw < 150 ? 18 : 21) : tw < 150 ? 19 : 25}px`,
                lineHeight: 1.05,
                color: lead ? 'var(--on-acc, #141414)' : 'var(--ink)',
                overflowWrap: 'anywhere',
              }}
            >
              {value}
            </span>
            <span
              style={{
                fontSize: '12px',
                lineHeight: '16px',
                color: lead ? 'var(--on-acc, #141414)' : 'var(--ink2)',
              }}
            >
              {label}
            </span>
          </div>
        )
      })}
      {texts['source'] ? (
        <div
          style={{
            position: 'absolute',
            left: `${pad}px`,
            right: `${pad}px`,
            top: `${tilesTop + rows * (th + gap) + 4}px`,
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            lineHeight: '15px',
            color: 'var(--ink2)',
            opacity: sstep((t - 19.4) / 0.4),
          }}
        >
          {texts['source']}
        </div>
      ) : null}
    </div>
  )
}

const height = (width: number) => Math.round(width * (width < 600 ? 2.25 : 0.64))

export const film: FilmModule = {
  duration,
  plans: [
    [0, 2.5],
    [2.5, 2.5],
    [5, 2.5],
    [7.5, 2.5],
    [10, 2.5],
    [12.5, 2.5],
    [15, 3],
    [18, 3],
  ],
  height,
  Stage,
}

/**
 * The final curve, still, as the 4:3 picture of the home page "Build" card:
 * the same real points and the same drawn curve as the film.
 */
export function WsbCurveThumb({ texts }: { texts: FilmTexts }): React.ReactNode {
  const frame: Frame = { L: 24, R: 376, T: 46, B: 262 }
  const { X, Y } = scales(frame)
  const { B } = frame
  const x7 = X(lastYear)
  const yTop = Y(total)
  const funded = texts['point.funded']
  const repayments = texts['point.repayments']
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid meet"
      role={funded ? 'img' : undefined}
      aria-label={funded || undefined}
      aria-hidden={funded ? undefined : true}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <path
        d={toArea(sample(frame, firstYear, pivotYear, 20), B)}
        style={{ fill: 'var(--surf2)' }}
      />
      <path d={toArea(sample(frame, pivotYear, lastYear, 20), B)} style={{ fill: 'var(--acc)' }} />
      <path
        d={`M16 ${B} L384 ${B}`}
        style={{ fill: 'none', stroke: 'var(--line)', strokeWidth: 1 }}
      />
      <path
        d={toPath(sample(frame, firstYear, lastYear, 20))}
        style={{ fill: 'none', stroke: 'var(--ink2)', strokeWidth: 1.5, strokeLinejoin: 'round' }}
      />
      <path
        d={`M${x7.toFixed(1)} ${yTop.toFixed(1)} L384 ${yTop.toFixed(1)}`}
        style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 1.5, strokeDasharray: '3 5' }}
      />
      {dotsAt.map(([year]) => (
        <circle
          key={year}
          cx={X(year).toFixed(1)}
          cy={Y(wsbFunded(year)).toFixed(1)}
          r={5}
          style={{ fill: 'var(--ink)', stroke: 'var(--surf)', strokeWidth: 2 }}
        />
      ))}
      {funded ? (
        <text
          x={(x7 - 10).toFixed(1)}
          y={(yTop - 12).toFixed(1)}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            fill: 'var(--ink)',
            textAnchor: 'end',
          }}
        >
          {funded}
        </text>
      ) : null}
      {repayments ? (
        <text
          x={384}
          y={(yTop + 22).toFixed(1)}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            fill: 'var(--ink2)',
            textAnchor: 'end',
          }}
        >
          {repayments}
        </text>
      ) : null}
    </svg>
  )
}
