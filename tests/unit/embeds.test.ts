import { describe, expect, it } from 'vitest'

import {
  spotifyEmbedUrl,
  validateSpotifyRef,
  validateVideoId,
  videoEmbedUrl,
} from '@/domain/embeds'

describe('video embeds', () => {
  it('accepts a YouTube id and builds a no-cookie embed', () => {
    expect(validateVideoId('youtube', 'dQw4w9WgXcQ')).toBe(true)
    expect(videoEmbedUrl('youtube', 'dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
  })

  it.each([
    ['youtube', 'https://youtu.be/dQw4w9WgXcQ'],
    ['youtube', 'dQw4w9WgXc"><script>'],
    ['tiktok', 'abc'],
    ['vimeo', '123456789'],
  ])('refuses %s %j', (platform, id) => {
    expect(validateVideoId(platform, id)).not.toBe(true)
  })
})

describe('spotify embeds', () => {
  it('accepts a playlist reference and builds its embed', () => {
    const ref = 'playlist:37i9dQZF1DXcBWIGoYBM5M'
    expect(validateSpotifyRef(ref)).toBe(true)
    expect(spotifyEmbedUrl(ref)).toBe(
      'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
    )
  })

  it.each([
    'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    'show:37i9dQZF1DXcBWIGoYBM5M',
    'playlist:short',
  ])('refuses %j', (ref) => {
    expect(validateSpotifyRef(ref)).not.toBe(true)
    expect(spotifyEmbedUrl(ref)).toBeNull()
  })
})
