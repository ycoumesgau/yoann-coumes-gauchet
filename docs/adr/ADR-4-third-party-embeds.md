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

## Amendment 1 — the series of shorts plays the next one (2026-10-20, L3d)

The prototype v2 that Yoann approved for coding ("J'ai l'impression qu'on est pas mal cette fois
sur le prototype… est-ce que, sur cette base, on peut coder le site ?") has a switch "Play next
automatically" on the series of shorts. So, on that one player only:

- `autoplay` is delegated (`allow` and `&autoplay=1`) once the visitor has picked a video, or
  turned the switch on and a video ended; never on page load.
- The player's own `postMessage` events tell the page a video ended: only from
  `youtube.com` / `youtube-nocookie.com` and from that iframe, once per video
  (`tests/unit/site-blocks.test.ts`).
- Thumbnails come from `i.ytimg.com`, a YouTube host the privacy page should name (owed: Yoann
  validates the line).

Every other player keeps the decision above: no `autoplay`.

## Amendment 2 — the Recipe2Video film ends on its Short (2026-10-20, L3d)

The Recipe2Video film (`_films/recipe2video-checks.tsx`) ends on the published Short it planned,
shown as a thumbnail from `i.ytimg.com` with a play button. The player loads only when the
visitor presses that button, and then plays at once (`autoplay` delegated, `allow` limited to
`encrypted-media; picture-in-picture; fullscreen; autoplay`): the press is the visitor's choice
to play. The video id is part of the film, like its drawings, so it lives in the code, not in
Payload.

## Amendment 2 — the series of shorts loads YouTube on play (2026-10-21, batch L)

The prototype shows the shorts as a still: the video's picture and title behind a play button.
Asked how to match it, Yoann chose on 2026-10-21 « Façade au clic » : « Vignette et titre au
repos, YouTube se charge quand le visiteur appuie sur lecture ; ADR-4 amendée sur ce point ».
So, on that one player only:

- At rest, the page shows the thumbnail from `i.ytimg.com` (built from the validated id) and a
  play button; no YouTube player loads until the visitor presses play or picks a video in the
  strip (`tests/unit/site-blocks.test.ts`).
- The arrows change the video without starting it; once started, the player plays each video
  the visitor picks. The switch is on by default, as in the prototype: it only acts after the
  visitor pressed play, so nothing plays on page load and Amendment 1 still holds.
- The thumbnail is still a request to Google's servers on page load; the privacy page already
  names YouTube.
- Every other player keeps the decision above: it loads with the page.
