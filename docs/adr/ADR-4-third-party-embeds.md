# ADR-4 — Third-party players load with the page, without a consent step

| Status   | Date       | Decided by |
| -------- | ---------- | ---------- |
| Accepted | 2026-10-20 | Yoann      |

## Context

The site shows videos (YouTube, TikTok, Instagram) and a Spotify player. An embedded player
requests its provider's servers as soon as it loads, and those players set cookies or similar
trackers. The CNIL requires consent before trackers that are not strictly necessary
(délibération n° 2020-091, lignes directrices cookies et autres traceurs); an information page
does not replace that consent.

The session first shipped players that load on click (L3b), which needs no consent banner.
Yoann's answer, 2026-10-20: "C'est pas grave si on respecte pas les trucs de la CNIL pour ce
site. On fait l'exception et, au pire, tu fais une petite page politique de confidentialité où
on explique le pourquoi." Then: "je pense que c'est plus propre si les médias se chargent et
peuvent se lancer facilement." The session had stated the risk in the thread before he decided.

## Decision

- Players load with the page (`loading="lazy"`: when they come near the screen), with no click
  gate and no consent banner.
- The embed URL is still rebuilt from a validated id (`src/domain/embeds.ts`), never taken from
  content; YouTube uses `youtube-nocookie.com`.
- A privacy page, entered as content, says which providers the players contact and why the site
  asks no consent (owed: drafted for Yoann's validation).
- No `autoplay` delegated to the players, and no `sandbox`: TikTok and Instagram embeds need
  several of its permissions, and a wrong set breaks them.

## Consequences

- One click to play; YouTube, TikTok, Instagram and Spotify receive the visitor's request as the
  player comes into view.
- The site does not follow the CNIL guidelines on these trackers: an accepted risk, Yoann's.
- `tests/unit/blocks.test.ts` checks that each player's URL is the rebuilt one and loads lazily.
