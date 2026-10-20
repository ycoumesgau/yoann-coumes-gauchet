/**
 * Third-party embeds are accepted only from a closed list of hosts, and only as
 * an id the site rebuilds the embed URL from: no editor (nor the MCP server)
 * can inject an arbitrary iframe source.
 */
export const videoPlatforms = ['youtube', 'tiktok', 'instagram'] as const
export type VideoPlatform = (typeof videoPlatforms)[number]

const videoIdPatterns: Record<VideoPlatform, RegExp> = {
  youtube: /^[A-Za-z0-9_-]{11}$/,
  tiktok: /^\d{15,25}$/,
  instagram: /^[A-Za-z0-9_-]{5,40}$/,
}

export const validateVideoId = (platform: unknown, id: unknown): true | string => {
  if (typeof platform !== 'string' || !(videoPlatforms as readonly string[]).includes(platform)) {
    return 'Unknown platform.'
  }
  if (typeof id !== 'string' || !videoIdPatterns[platform as VideoPlatform].test(id)) {
    return `Not a valid ${platform} video id.`
  }
  return true
}

export const videoEmbedUrl = (platform: VideoPlatform, id: string): string => {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${id}`
    case 'tiktok':
      return `https://www.tiktok.com/embed/v2/${id}`
    case 'instagram':
      return `https://www.instagram.com/reel/${id}/embed`
  }
}

const spotifyPattern = /^(playlist|album|track|artist):([A-Za-z0-9]{22})$/

/** A Spotify reference such as `playlist:37i9dQZF1DXcBWIGoYBM5M`. */
export const validateSpotifyRef = (value: unknown): true | string =>
  typeof value === 'string' && spotifyPattern.test(value)
    ? true
    : 'Use `playlist:<id>`, `album:<id>`, `track:<id>` or `artist:<id>` (22-character Spotify id).'

export const spotifyEmbedUrl = (ref: string): string | null => {
  const match = spotifyPattern.exec(ref)
  return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null
}
