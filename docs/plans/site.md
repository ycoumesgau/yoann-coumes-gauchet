# Plan — the site

Memory between sessions: read at the start, updated at the end. Decisions: `docs/adr/`.
The detailed brief (content, demos, Claude Design) lives in Yoann's project files.

## 0. State on 2026-10-20

- Yoann's decisions (2026-10-20): the site is a demonstration; Payload 4; an MCP server usable
  from Claude everywhere, including deletion under his confirmation; Supabase EU free plan; French
  and English; he alone decides when it goes public and when he applies to jobs. Nothing is
  published before it is ready and clean.
- Visual direction from Claude Design: track "1A", a neutral background that leaves room for
  screenshots, videos and animations of the products. Animations and wording of the Design pass
  are to be redone; the text source is the validated content document.

## 1. Batches

| Batch | Content                                                                     | Status                 |
| ----- | --------------------------------------------------------------------------- | ---------------------- |
| L0    | Method: CLAUDE.md, ADRs, hostile reviewer, hooks, pre-push, CI, PR template | In progress            |
| L1    | Next 16.4 + Payload 4 beta, content model, FR/EN, first migration, tests    | In progress            |
| L2a   | MCP plugin, audit log, kill switch                                          | Done, in review        |
| L2b   | OAuth server (ADR-2), deletion confirmation; connector added in claude.ai   | Done; connector: Yoann |
| L3    | Front end from the mockup; content entered through the MCP server           | Waits for the mockup   |
| L4    | Demos, in batches                                                           | To do                  |
| L5    | Lighthouse, repository public, DNS switched to Vercel                       | Yoann's go             |

## 2. Owed by Yoann

- Create the Supabase EU project; set `DATABASE_URL` and `PAYLOAD_SECRET` in Vercel.
- Create the administrator account **before** the deployment URL is shared or reachable: Payload
  lets the first visitor of an empty `users` table create it.
- Add the MCP connector in claude.ai (L2b).
- Switch the DNS of `yoann.coumes-gauchet.fr` from Figma to Vercel (L5).

## 3. Open questions for Yoann

- Default locale: `en` (assumed: a recruiter at Mistral reads English first), or `fr`?

## 4. Content inputs given by Yoann

- Spotify (2026-10-20): artist `artist:3r1CwJAxYcji4TTINozzWi`, playlist
  `playlist:32nEjBqPrGjsohHLfqVhI9` (refs for the Spotify block; both pass `validateSpotifyRef`).

## 5. Demos

Source: Yoann's project file `synthese/03-site-refonte-concept.md` §3 (2026-10-20). The ids are
`src/domain/demos.ts`; what each one may show is decided there, not here.

| Id  | Key                       | Demo                                             |
| --- | ------------------------- | ------------------------------------------------ |
| D1  | `paper-to-deliverable`    | Opening animation: from paper to the deliverable |
| D2  | `nexcan-case`             | Nexcan, an invented case end to end              |
| D3  | `photo-bench`             | The Photos bench, interactive, models anonymised |
| D4  | `screening-toy`           | Name screening, a toy on invented names          |
| D5  | `luma-video`              | Luma on video                                    |
| D6  | `recipe-ingestion`        | Recipe ingestion, animated diagram               |
| D7  | `recipe2video-validation` | Recipe2Video validation, before and after        |
| D8  | `recipe2video-videos`     | The videos produced                              |
| D9  | `build-log`               | The build log, as a dashboard                    |
| D10 | `hostile-review`          | The hostile reviewer, explained                  |
| D11 | `background-video`        | Video explainer of the career path               |
| D12 | `ask-this-site`           | "Ask this site", closed corpus                   |
| D13 | `accounting-agent`        | The accounting agent, diagram                    |

## 6. Journal

- 2026-10-20: L0 and L1 started. Content model: `pages` (blocks hero, section, project cards,
  demo, timeline), `projects`, `media`, `users`, global `site`. Mutation run: `publishedOrAdmin`
  returning `true` turns two database tests red.
- 2026-10-20: hostile review of L0+L1. Fixed: old versions and trashed documents were public
  (seen red in `tests/db/public-surface.test.ts` before the fix), `isAdmin` now requires a
  `users` account, `.riv` is the only binary upload, the no-verify and memory guards have tests,
  hooks use `$CLAUDE_PROJECT_DIR`, CI runs Postgres 17. Rejected findings are listed on PR #1.
- 2026-10-20: L2 written. Run end to end on `next dev`: discovery, 401 challenge, consent with
  the `/admin` session (no session: redirect to login, no ticket), cross-origin POST 403, token
  exchange, MCP `initialize`, 17 tools listed, `deleteDocuments` absent, `users` and OAuth
  collections refused, trash then deletion request, self-confirmation refused, journal rows
  written. Five mutations seen red in `tests/db/mcp-oauth.test.ts`. Accepted: Payload's
  `payload-llm-instructions` follows the read access of its targets, so instructions on public
  collections are public; the repository is public too.
