/**
 * A third-party player (video or playlist), loaded with the page so it plays
 * in one click. Yoann's choice (ADR-4): no consent step, explained on a privacy
 * page entered as content. The URL is rebuilt from a validated id
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
      // No `autoplay`: nothing starts without the visitor's own click in the player.
      allow="encrypted-media; picture-in-picture; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  )
}
