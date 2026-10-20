/**
 * A third-party player (video or playlist), loaded with the page so it plays
 * in one click. Yoann's choice (ADR-4): no consent step; the privacy page says
 * what the providers receive. The URL is rebuilt from a validated id
 * (`src/domain/embeds.ts`), never taken from content.
 */
export function Embed({
  src,
  title,
  aspect,
}: {
  src: string
  title: string
  aspect: 'vertical' | 'player'
}) {
  return (
    <iframe
      className={`embed embed-${aspect}`}
      src={src}
      title={title}
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  )
}
