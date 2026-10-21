'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import type { DemoKey } from '@/domain/demos'

import type { FrameLabels } from '../_blocks/render-blocks'
import { film as nexcanInventory } from './nexcan-inventory'
import { film as nexcanPhotos } from './nexcan-photos'
import { film as nexcanScreening } from './nexcan-screening'
import { stageHeight } from './fit'
import type { FilmModule } from './types'
import { film as wsbFunding } from './wsb-funding'
import { film as hostileReview } from './hostile-review'
import { film as recipe2videoChecks } from './recipe2video-checks'
import { film as accountingAgent } from './accounting-agent'

/** Every film by key. A key without a module renders nothing. */
export const films: Partial<Record<DemoKey, FilmModule>> = {
  'nexcan-inventory': nexcanInventory,
  'nexcan-screening': nexcanScreening,
  'nexcan-photos': nexcanPhotos,
  'wsb-funding': wsbFunding,
  'hostile-review': hostileReview,
  'recipe2video-checks': recipe2videoChecks,
  'accounting-agent': accountingAgent,
}

export type FilmTexts = Readonly<Record<string, string>>

/** Fired when a film starts, so that every other film pauses. */
const playEvent = 'yfilm'
/** Width drawn before the page measures the frame (server render, first paint). */
const firstWidth = 960

export function Film({
  demo,
  labels,
  texts,
  still = false,
}: {
  demo: DemoKey
  labels: FrameLabels
  /** This film's words in the page's language, by key (`site.filmTexts`). */
  texts: FilmTexts
  still?: boolean
}) {
  const film = films[demo]
  if (!film) return null
  return still ? (
    <FilmStill demo={demo} film={film} texts={texts} />
  ) : (
    <FilmPlayer key={demo} demo={demo} film={film} labels={labels} texts={texts} />
  )
}

/** The last frame alone, scaled to fill its container: a card's thumbnail. */
function FilmStill({ demo, film, texts }: { demo: DemoKey; film: FilmModule; texts: FilmTexts }) {
  const root = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)
  const H = film.height(firstWidth)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (el.clientWidth && el.clientHeight)
        setScale(Math.min(el.clientWidth / firstWidth, el.clientHeight / H))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [H])
  return (
    <div
      ref={root}
      className="film-still"
      data-demo={demo}
      aria-hidden
      inert
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: firstWidth,
          height: H,
          overflow: 'hidden',
          transform: `translate(-50%, -50%) scale(${scale.toFixed(4)})`,
        }}
      >
        <film.Stage t={film.duration} playing={false} width={firstWidth} height={H} texts={texts} />
      </div>
    </div>
  )
}

type Controls = { toggle: () => void; seek: (at: number) => void }

function FilmPlayer({
  demo,
  film,
  labels,
  texts,
}: {
  demo: DemoKey
  film: FilmModule
  labels: FrameLabels
  texts: FilmTexts
}) {
  const D = film.duration
  const root = useRef<HTMLDivElement>(null)
  const controls = useRef<Controls | null>(null)
  const [width, setWidth] = useState(firstWidth)
  // Before it plays, a film shows its last frame: the poster.
  const [t, setT] = useState(D)
  const [playing, setPlaying] = useState(false)
  const [played, setPlayed] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState({ viewport: 0, header: 0, chrome: 0 })

  // What the screen leaves for the stage: the small viewport, less the sticky
  // header and the film's own controls and caption.
  useEffect(() => {
    const probe = document.createElement('div')
    probe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none'
    document.body.appendChild(probe)
    const measure = () => {
      const el = root.current
      const st = stage.current
      if (!el || !st) return
      const next = {
        viewport: probe.offsetHeight || window.innerHeight,
        header: document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0,
        chrome: el.offsetHeight - st.offsetHeight,
      }
      setFrame((old) =>
        old.viewport === next.viewport && old.header === next.header && old.chrome === next.chrome
          ? old
          : next,
      )
    }
    measure()
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    if (root.current) ro.observe(root.current)
    return () => {
      window.removeEventListener('resize', measure)
      ro.disconnect()
      probe.remove()
    }
  }, [])

  useEffect(() => {
    const c = { t: D, on: false, last: 0, raf: 0, played: false, userPaused: false, reduced: false }
    const id = Math.random().toString(36).slice(2)
    c.reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const set = (at: number) => {
      c.t = at
      setT(at)
    }
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - c.last) / 1000)
      c.last = now
      const next = c.t + dt
      if (next >= D) {
        c.on = false
        set(D)
        setPlaying(false)
        return
      }
      set(next)
      c.raf = requestAnimationFrame(tick)
    }
    const play = () => {
      if (c.on) return
      c.on = true
      if (c.t >= D) set(0)
      c.played = true
      setPlayed(true)
      window.dispatchEvent(new CustomEvent(playEvent, { detail: id }))
      c.last = performance.now()
      setPlaying(true)
      c.raf = requestAnimationFrame(tick)
    }
    const pause = () => {
      cancelAnimationFrame(c.raf)
      if (c.on) {
        c.on = false
        setPlaying(false)
      }
    }
    const seek = (at: number) => {
      set(at)
      c.userPaused = false
      c.reduced = false
      play()
    }
    controls.current = {
      toggle: () => {
        if (c.on) {
          c.userPaused = true
          pause()
          return
        }
        c.userPaused = false
        c.reduced = false
        play()
      },
      seek,
    }
    const onOther = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) pause()
    }
    window.addEventListener(playEvent, onOther)
    const el = root.current
    const ro = new ResizeObserver(() => {
      if (!el) return
      const w = el.clientWidth
      setWidth((old) => (w && Math.abs(w - old) > 1 ? w : old))
    })
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1]
        if (!e) return
        if (e.intersectionRatio >= 0.55) {
          if (!c.userPaused && !c.reduced && (!c.played || c.t < D)) play()
        } else pause()
      },
      { threshold: [0, 0.55, 1] },
    )
    if (el) {
      ro.observe(el)
      io.observe(el)
    }
    return () => {
      cancelAnimationFrame(c.raf)
      c.on = false
      ro.disconnect()
      io.disconnect()
      window.removeEventListener(playEvent, onOther)
      controls.current = null
    }
  }, [D])

  const now = Math.min(t, D)
  const button = playing ? labels.pause : now >= D && played ? labels.replay : labels.play
  const H = stageHeight(film.height(width), { width, ...frame })
  const control: React.CSSProperties = {
    fontFamily: 'var(--sans)',
    color: 'var(--ink)',
    background: 'transparent',
    border: '1px solid var(--line)',
    borderRadius: 999,
    cursor: 'pointer',
    flex: 'none',
  }
  return (
    <div
      ref={root}
      className="film"
      data-demo={demo}
      style={{ width: '100%', fontFamily: 'var(--sans)', color: 'var(--ink)' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '10px 14px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        {texts.number ? (
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--ink2)',
              whiteSpace: 'nowrap',
            }}
          >
            {texts.number}
          </span>
        ) : null}
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {film.plans.map(([at, length], i) => {
            const name = texts.shot ? `${texts.shot} ${i + 1}` : String(i + 1)
            return (
              <button
                key={i}
                type="button"
                onClick={() => controls.current?.seek(at)}
                aria-label={name}
                title={name}
                style={{
                  flex: 1,
                  height: 24,
                  padding: 0,
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 4,
                    background: 'var(--line)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      height: '100%',
                      width: `${(Math.max(0, Math.min(1, (now - at) / length)) * 100).toFixed(1)}%`,
                      background: 'var(--ink)',
                    }}
                  />
                </span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => controls.current?.seek(0)}
          aria-label={labels.restart ?? undefined}
          title={labels.restart ?? undefined}
          style={{ ...control, fontSize: 15, lineHeight: 1, width: 32, height: 30, padding: 0 }}
        >
          <span aria-hidden>↺</span>
        </button>
        <button
          type="button"
          onClick={() => controls.current?.toggle()}
          style={{ ...control, fontSize: 13, fontWeight: 500, padding: '5px 14px', minWidth: 84 }}
        >
          {button}
        </button>
      </div>
      <div
        ref={stage}
        style={{ position: 'relative', overflow: 'hidden', height: H, background: 'var(--surf)' }}
      >
        <film.Stage t={now} playing={playing} width={width} height={H} texts={texts} />
        {!playing && !played && labels.play ? (
          <button
            type="button"
            onClick={() => controls.current?.toggle()}
            aria-label={labels.play}
            title={labels.play}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 56,
              height: 56,
              marginLeft: -28,
              marginTop: -28,
              borderRadius: '50%',
              border: 0,
              padding: 0,
              cursor: 'pointer',
              background: 'var(--acc)',
              boxShadow: '0 4px 16px rgba(0,0,0,.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 0,
                height: 0,
                borderLeft: '16px solid var(--on-acc, #141414)',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                marginLeft: 4,
              }}
            />
          </button>
        ) : null}
        {texts.tag ? (
          <span
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '.02em',
              color: 'var(--ink2)',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              borderRadius: 3,
              padding: '3px 8px',
            }}
          >
            {texts.tag}
          </span>
        ) : null}
      </div>
      {texts.caption ? (
        <div
          style={{
            padding: '10px 14px',
            borderTop: '1px solid var(--line)',
            fontSize: 14,
            lineHeight: '20px',
            color: 'var(--ink2)',
          }}
        >
          {texts.caption}
        </div>
      ) : null}
    </div>
  )
}
