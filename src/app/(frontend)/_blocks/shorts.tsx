'use client'

import { useEffect, useRef, useState } from 'react'

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

/**
 * The series of shorts: one player, loaded with the page (ADR-4), and a strip
 * to pick another. A video starts on its own only after the visitor picked it
 * or asked for the next one to follow.
 */
export function Shorts({
  videos,
  labels,
  links,
}: {
  videos: Video[]
  labels: { previous: string; next: string; autoplay: string }
  links: { id?: string | null; label: string; url: string }[]
}) {
  const [index, setIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const [follow, setFollow] = useState(false)
  const frame = useRef<HTMLIFrameElement | null>(null)
  const strip = useRef<HTMLDivElement | null>(null)
  const ended = useRef<string | null>(null)
  const scrolledTo = useRef(0)
  const video = videos[index] ?? videos[0]
  const count = videos.length
  const playing = video?.videoId ?? ''

  const pick = (next: number) => {
    setIndex((next + count) % count)
    setStarted(true)
  }

  // Bring the chosen thumbnail into the strip, never on load and never by
  // scrolling the page itself.
  useEffect(() => {
    if (scrolledTo.current === index) return
    scrolledTo.current = index
    const box = strip.current
    const item = box?.querySelector<HTMLElement>(`[data-index="${index}"]`)
    if (!box || !item) return
    const offset = item.getBoundingClientRect().left - box.getBoundingClientRect().left
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    box.scrollTo({
      left: box.scrollLeft + offset - (box.clientWidth - item.offsetWidth) / 2,
      behavior: still ? 'auto' : 'smooth',
    })
  }, [index])

  useEffect(() => {
    if (!follow) return
    const onMessage = (event: MessageEvent) => {
      if (!isPlayerOrigin(event.origin)) return
      if (event.source !== frame.current?.contentWindow) return
      if (playerState(event.data) !== 0 || !advancesOn(ended.current, playing)) return
      ended.current = playing
      setIndex((current) => (current + 1) % count)
      setStarted(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [follow, count, playing])

  if (!video) return null
  const src = video.platform === 'youtube' ? youtubeSrc(video.src, started) : video.src

  return (
    <div className="shorts">
      <div>
        <div className="shorts-player">
          <iframe
            ref={frame}
            key={src}
            className="embed embed-vertical"
            src={src}
            title={video.title}
            loading="lazy"
            allow={`encrypted-media; picture-in-picture; fullscreen${started ? '; autoplay' : ''}`}
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={(event) => {
              // Ask the player to report its state (YouTube's iframe API handshake).
              event.currentTarget.contentWindow?.postMessage(
                JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
                '*',
              )
            }}
          />
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
      <div>
        <div className="shorts-bar">
          <span className="shorts-count">
            {index + 1} / {count}
          </span>
          <span className="shorts-title">{video.label}</span>
          <div className="shorts-controls">
            <button
              type="button"
              className="round"
              onClick={() => pick(index - 1)}
              aria-label={labels.previous}
            >
              ←
            </button>
            <button
              type="button"
              className="round"
              onClick={() => pick(index + 1)}
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
              onClick={() => pick(i)}
            >
              {item.platform === 'youtube' ? (
                // eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail
                <img
                  src={`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                />
              ) : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
