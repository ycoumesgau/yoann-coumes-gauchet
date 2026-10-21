'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import type { VideoPlatform } from '@/domain/embeds'

type Video = { src: string; platform: VideoPlatform; videoId: string; title: string; label: string }

/** YouTube player options: its API (to know when a video ends), no related videos from others. */
export const youtubeSrc = (src: string, autoplay: boolean): string =>
  `${src}?enablejsapi=1&playsinline=1&rel=0${autoplay ? '&autoplay=1' : ''}`

/** A YouTube player's state from its `postMessage` events; 0 means the video ended. */
export const playerState = (data: unknown): number | null => {
  try {
    const message = typeof data === 'string' ? JSON.parse(data) : data
    if (message?.event === 'onStateChange' && typeof message.info === 'number') return message.info
    if (message?.event === 'infoDelivery' && typeof message.info?.playerState === 'number')
      return message.info.playerState
  } catch {
    // Not a player message.
  }
  return null
}

/** Only YouTube's own players may tell the carousel a video ended. */
export const isPlayerOrigin = (origin: string): boolean =>
  /^https:\/\/www\.youtube(-nocookie)?\.com$/.test(origin)

/**
 * YouTube reports one ending twice (`onStateChange` and `infoDelivery`), often
 * before the next player replaces this one: the carousel moves on once per
 * video, the first time that video ends.
 */
export const advancesOn = (ended: string | null, playing: string): boolean => ended !== playing

/** The video shown first: its place in the list (1-based), within the list, the first unless set. */
export const startIndex = (start: number | null | undefined, count: number): number =>
  typeof start === 'number' && Number.isInteger(start) && start >= 1 && start <= count
    ? start - 1
    : 0

/**
 * The series of shorts, as in the prototype (L341-387): at rest, the player
 * shows the video's thumbnail and title behind a play button, and YouTube
 * loads only once the visitor asks for it (ADR-4, amended 2026-10-21). The
 * strip picks and plays another; before the first play, the arrows change the
 * video without starting it, and after it they play the one they reach, as in
 * the prototype. Once a video played, the next follows it unless the visitor
 * turned that off. TikTok and Instagram players load with the page (ADR-4).
 */
export function Shorts({
  videos,
  labels,
  links,
  start,
  aside,
}: {
  videos: Video[]
  labels: { previous: string; next: string; autoplay: string; play: string }
  links: { id?: string | null; label: string; url: string }[]
  start?: number | null
  /** Shown under the strip, in the same column (the Spotify player). */
  aside?: ReactNode
}) {
  const [index, setIndex] = useState(() => startIndex(start, videos.length))
  const [started, setStarted] = useState(false)
  const [follow, setFollow] = useState(true)
  const frame = useRef<HTMLIFrameElement | null>(null)
  const strip = useRef<HTMLDivElement | null>(null)
  const ended = useRef<string | null>(null)
  const scrolledTo = useRef(index)
  const video = videos[index] ?? videos[0]
  const count = videos.length
  const playing = video?.videoId ?? ''

  const step = (by: number) => {
    ended.current = null
    setIndex((current) => (current + by + count) % count)
  }
  const pick = (next: number) => {
    ended.current = null
    setIndex((next + count) % count)
    setStarted(true)
  }

  // Bring the chosen thumbnail to the start of the strip, never on load and
  // never by scrolling the page itself.
  useEffect(() => {
    if (scrolledTo.current === index) return
    scrolledTo.current = index
    const box = strip.current
    const item = box?.querySelector<HTMLElement>(`[data-index="${index}"]`)
    if (!box || !item) return
    const offset = item.getBoundingClientRect().left - box.getBoundingClientRect().left
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    box.scrollTo({
      left: Math.max(0, box.scrollLeft + offset - 8),
      behavior: still ? 'auto' : 'smooth',
    })
  }, [index])

  useEffect(() => {
    if (!follow || !started) return
    const onMessage = (event: MessageEvent) => {
      if (!isPlayerOrigin(event.origin)) return
      if (event.source !== frame.current?.contentWindow) return
      if (playerState(event.data) !== 0 || !advancesOn(ended.current, playing)) return
      ended.current = playing
      setIndex((current) => (current + 1) % count)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [follow, started, count, playing])

  if (!video) return null
  const youtube = video.platform === 'youtube'
  const loaded = started || !youtube
  const src = youtube ? youtubeSrc(video.src, true) : video.src
  const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

  return (
    <div className="shorts">
      <div className="shorts-main">
        <div className="shorts-player">
          {loaded ? (
            <iframe
              ref={frame}
              key={src}
              src={src}
              title={video.title}
              loading="lazy"
              allow={`encrypted-media; picture-in-picture; fullscreen${youtube ? '; autoplay' : ''}`}
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={(event) => {
                // Ask the player to report its state (YouTube's iframe API handshake).
                event.currentTarget.contentWindow?.postMessage(
                  JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
                  '*',
                )
              }}
            />
          ) : (
            <button
              type="button"
              className="shorts-facade"
              aria-label={labels.play ? `${labels.play} ${video.label}` : video.label}
              onClick={() => setStarted(true)}
            >
              {youtube ? (
                <span
                  className="shorts-thumb"
                  style={{ backgroundImage: `url(${thumb(video.videoId)})` }}
                />
              ) : null}
              <span className="shorts-shade" />
              <span className="shorts-play" aria-hidden="true" />
              <span className="shorts-facade-title" aria-hidden="true">
                {video.label}
              </span>
            </button>
          )}
        </div>
        {links.length ? (
          <p className="channel-links">
            {links.map((link, i) => (
              <a key={link.id ?? i} href={link.url} target="_blank" rel="noopener">
                → {link.label}
              </a>
            ))}
          </p>
        ) : null}
      </div>
      <div className="shorts-side">
        <div className="shorts-head">
          <span className="shorts-count">
            {index + 1} / {count}
          </span>
          <span className="shorts-title">{video.label}</span>
          <div className="shorts-controls">
            <button
              type="button"
              className="round"
              onClick={() => step(-1)}
              aria-label={labels.previous}
            >
              ←
            </button>
            <button
              type="button"
              className="round"
              onClick={() => step(1)}
              aria-label={labels.next}
            >
              →
            </button>
            {labels.autoplay ? (
              <button
                type="button"
                className="switch"
                role="switch"
                aria-checked={follow}
                onClick={() => setFollow((value) => !value)}
              >
                <span className="switch-track" aria-hidden="true" />
                {labels.autoplay}
              </button>
            ) : null}
          </div>
        </div>
        <div className="shorts-strip" ref={strip}>
          {videos.map((item, i) => (
            <button
              key={item.videoId}
              type="button"
              className="short"
              data-index={i}
              aria-current={i === index ? 'true' : undefined}
              aria-label={labels.play ? `${labels.play} ${item.label}` : undefined}
              onClick={() => pick(i)}
            >
              <span className="short-thumb">
                {item.platform === 'youtube' ? (
                  // eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail
                  <img src={thumb(item.videoId)} alt="" loading="lazy" />
                ) : null}
              </span>
              <span className="short-title">{item.label}</span>
            </button>
          ))}
        </div>
        {aside}
      </div>
    </div>
  )
}
