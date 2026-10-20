'use client'

import { useState, type CSSProperties } from 'react'

import { videoEmbedUrl } from '@/domain/embeds'

import { youtubeSrc } from '../_blocks/shorts'
import type { FilmModule, StageProps } from './types'

/**
 * Film 4: the real plan of the "Carrot Tarte Tatin" Short, as it sits in the
 * Recipe2Video repository. The checks catch the wrong mold before any credit
 * is spent, every card turns green with the rule it passed, and the film ends
 * on the published Short, played on a click.
 */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const sstep = (x: number) => {
  const c = clamp01(x)
  return c * c * (3 - 2 * c)
}
const fade = (t: number, a: number, b: number) =>
  sstep((t - a) / 0.35) * (1 - sstep((t - b) / 0.35))

const OK = 'var(--ok, #1E7338)'
const OK_SOFT = 'var(--ok-soft, color-mix(in srgb, var(--ok, #1E7338) 14%, var(--surf)))'

/** The published Short (YouTube). */
const VIDEO_ID = 'LtwZ65Jc2eY'

/** The seven cards of the plan; their words are `row.<n>.title`, `.duration`, `.rule`. */
const ROWS = ['01', '02', '03', '04', '05', '06', '07'] as const
/** The card the checks catch (the mold), by index. */
const CAUGHT = 3

const DURATION = 12.5

const caption = (
  t: number,
  a: number,
  b: number,
  pos: CSSProperties,
  extra: CSSProperties = {},
): CSSProperties => ({
  position: 'absolute',
  fontFamily: 'var(--sans)',
  fontSize: '15px',
  lineHeight: '20px',
  fontWeight: 500,
  color: 'var(--ink2)',
  opacity: fade(t, a, b),
  transform: `translateY(${((1 - sstep((t - a) / 0.35)) * 6).toFixed(1)}px)`,
  ...pos,
  ...extra,
})

function Stage({ t, width: w, texts }: StageProps) {
  const [started, setStarted] = useState(false)
  const vert = w < 600
  const H = height(w)
  const pad = vert ? 16 : 28
  const top = vert ? 132 : 122
  const rowH = vert ? 62 : 50
  const gap = 6
  const listW = vert ? w - pad * 2 : Math.round(w * 0.6)
  const right = vert ? pad : w - pad - listW
  const listBottom = top + ROWS.length * (rowH + gap)

  let vw: number, vh: number, vx: number, vy: number
  if (!vert) {
    vw = Math.round(Math.min(w - pad * 3 - listW, ((H - 48) * 9) / 16))
    vh = Math.round((vw * 16) / 9)
    vx = w - pad - vw
    vy = Math.round((H - vh) / 2)
  } else {
    vw = Math.round(w * 0.7)
    vh = Math.round((vw * 16) / 9)
    vx = Math.round((w - vw) / 2)
    vy = listBottom + 44
  }
  const vo = started ? 1 : sstep((t - 11) / 0.5)
  const capPos: CSSProperties = {
    left: pad + 'px',
    right: right + 'px',
    top: (vert ? 94 : 86) + 'px',
  }
  const embed = videoEmbedUrl('youtube', VIDEO_ID)

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: pad + 'px',
          right: right + 'px',
          top: '18px',
          fontFamily: 'var(--serif)',
          fontSize: vert ? '22px' : '28px',
          lineHeight: vert ? '27px' : '32px',
          color: 'var(--ink)',
          opacity: sstep(t / 0.4),
          textWrap: 'balance',
        }}
      >
        {texts.head}
      </div>
      <div
        style={{
          position: 'absolute',
          left: pad + 'px',
          top: (vert ? 70 : 56) + 'px',
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: 'var(--ink2)',
          opacity: sstep((t - 1.0) / 0.4),
        }}
      >
        {texts.sub}
      </div>
      <div style={caption(t, 0.3, 2.4, capPos)}>{texts['caption.written']}</div>
      <div style={caption(t, 6.3, 8.9, capPos, { color: 'var(--anom)', fontWeight: 600 })}>
        {texts['caption.caught']}
      </div>
      <div style={caption(t, 9.0, 99, capPos, { color: OK, fontWeight: 600 })}>
        {texts['caption.passed']}
      </div>
      {ROWS.map((n, k) => {
        const ap = sstep((t - 2.6 - k * 0.35) / 0.3)
        const g = 9.0 + k * 0.25
        const red = k === CAUGHT && t >= 6.3 && t < 7.8
        const fixed = k === CAUGHT && t >= 7.8 && t < g
        const green = t >= g
        const status = green
          ? texts[`row.${n}.rule`]
          : red
            ? texts['row.04.flag']
            : fixed
              ? texts['row.04.fix']
              : undefined
        return (
          <div
            key={n}
            style={{
              position: 'absolute',
              left: pad + 'px',
              top: top + k * (rowH + gap) + 'px',
              width: listW + 'px',
              height: rowH + 'px',
              boxSizing: 'border-box',
              display: 'grid',
              gridTemplateColumns: '28px minmax(0,1fr) auto',
              alignItems: 'center',
              gap: '12px',
              padding: '0 14px',
              border: '1px solid ' + (red ? 'var(--anom)' : green ? OK : 'var(--line)'),
              background: red ? 'var(--anom-soft)' : green ? OK_SOFT : 'var(--surf)',
              borderRadius: '6px',
              opacity: ap,
              transform: `translateY(${((1 - ap) * 8).toFixed(1)}px)`,
              transition: 'background .3s, border-color .3s',
            }}
          >
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--mut)' }}>
              {n}
            </span>
            <span
              style={{ fontSize: '15px', lineHeight: '19px', color: 'var(--ink)', minWidth: 0 }}
            >
              {texts[`row.${n}.title`]}
              <span
                style={{
                  display: 'block',
                  fontSize: '13px',
                  lineHeight: '17px',
                  fontWeight: 600,
                  color: red ? 'var(--anom)' : green ? OK : 'var(--ink2)',
                  marginTop: '1px',
                }}
              >
                {status}
              </span>
            </span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                color: 'var(--ink2)',
                whiteSpace: 'nowrap',
              }}
            >
              {texts[`row.${n}.duration`]}
            </span>
          </div>
        )
      })}
      <div
        style={{
          position: 'absolute',
          left: pad + 'px',
          top: listBottom + 6 + 'px',
          fontFamily: 'var(--mono)',
          fontSize: '13px',
          color: 'var(--ink)',
          opacity: sstep((t - 5.2) / 0.4),
        }}
      >
        {texts.total}
      </div>
      <div
        data-film-video=""
        style={{
          position: 'absolute',
          left: vx + 'px',
          top: vy + 'px',
          width: vw + 'px',
          height: vh + 'px',
          borderRadius: '10px',
          overflow: 'hidden',
          background: '#151515',
          boxShadow: '0 10px 30px rgba(0,0,0,.18)',
          opacity: vo,
          transform: `scale(${(0.94 + 0.06 * vo).toFixed(3)})`,
          pointerEvents: vo > 0.5 ? 'auto' : 'none',
        }}
      >
        {started && embed ? (
          <iframe
            src={youtubeSrc(embed, true)}
            title={texts['video.title']}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setStarted(true)}
            aria-label={texts['video.play']}
            tabIndex={vo > 0.5 ? 0 : -1}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              padding: 0,
              border: 0,
              cursor: 'pointer',
              background: '#151515',
              display: 'block',
              textAlign: 'left',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail */}
            <img
              src={`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 'auto 0 0 0',
                height: '50%',
                background: 'linear-gradient(transparent,rgba(0,0,0,.8))',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '14px',
                right: '14px',
                bottom: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <span
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--acc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '14px solid #141414',
                    borderTop: '9px solid transparent',
                    borderBottom: '9px solid transparent',
                    marginLeft: '4px',
                  }}
                />
              </span>
              <span
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '20px',
                  lineHeight: 1.15,
                  color: '#FFFFFF',
                }}
              >
                {texts['video.title']}
              </span>
            </span>
          </button>
        )}
      </div>
      {texts.tag ? (
        <span
          style={{
            position: 'absolute',
            right: '10px',
            bottom: '10px',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            letterSpacing: '.02em',
            color: 'var(--ink2)',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            padding: '3px 8px',
          }}
        >
          {texts.tag}
        </span>
      ) : null}
    </>
  )
}

/** Wide: about 0.62 of the width, never under 560 px; narrow: the cards, then the 9:16 video. */
const height = (w: number): number =>
  w < 600 ? Math.round(w * 3.25) : Math.max(Math.round(w * 0.62), 560)

export const film: FilmModule = {
  duration: DURATION,
  plans: [
    [0, 2.5],
    [2.5, 3.5],
    [6, 3],
    [9, 2],
    [11, 1.5],
  ],
  height,
  Stage,
}
