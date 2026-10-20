# ADR-4 — Third-party players load on click

| Status   | Date       | Decided by                         |
| -------- | ---------- | ---------------------------------- |
| Proposed | 2026-10-20 | The session; Yoann can overturn it |

## Context

The site shows videos (YouTube, TikTok, Instagram) and a Spotify playlist (Yoann, 2026-10-20). An
embedded player requests its provider's servers as soon as the page loads, and those players set
cookies or similar trackers. The CNIL requires consent before such trackers when they are not
strictly necessary (délibération n° 2020-091, lignes directrices cookies et autres traceurs);
`youtube-nocookie.com` reduces but does not remove them.

## Decision

- No third-party request before the visitor asks: each player is a button named by its content
  (`EmbedFacade`); the click replaces it with the provider's iframe.
- The embed URL is rebuilt from a validated id (`src/domain/embeds.ts`), never taken from content.
- A short notice under the button, written in Payload (`site.thirdPartyNotice`, per language).
- Hence no consent banner: the site's only cookie is the language choice (interface
  personalisation, exempt).

## Consequences

- One extra click to play. Posters, when set, are served from the media library, not by the
  provider.
- `tests/unit/blocks.test.ts` checks that the server HTML of a page holds no iframe.
