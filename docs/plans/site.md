# Plan — the site

Memory between sessions: read at the start, updated at the end. Decisions: `docs/adr/`.
The detailed brief (content, demos, Claude Design) lives in Yoann's project files.

## 0. State on 2026-10-20

- Yoann's decisions (2026-10-20): the site is a demonstration; Payload 4; an MCP server usable
  from Claude everywhere, including deletion under his confirmation; Supabase EU free plan; French
  and English; he alone decides when it goes public and when he applies to jobs. Nothing is
  published before it is ready and clean.
- Languages (Yoann, 2026-10-20): the browser's language decides, a switch in the header is
  always visible and remembered, any other language falls back to English. Each language has
  its own URL (`/en`, `/fr`) so both are indexed.
- Visual direction: the "1A" mockup was criticised and is not kept; a new Claude Design pass
  follows the message platform. Nothing visual is coded before it.

## 1. Batches

| Batch | Content                                                                     | Status                 |
| ----- | --------------------------------------------------------------------------- | ---------------------- |
| L0    | Method: CLAUDE.md, ADRs, hostile reviewer, hooks, pre-push, CI, PR template | In progress            |
| L1    | Next 16.4 + Payload 4 beta, content model, FR/EN, first migration, tests    | In progress            |
| L2a   | MCP plugin, audit log, kill switch                                          | Done, in review        |
| L2b   | OAuth server (ADR-2), deletion confirmation; connector added in claude.ai   | Done; connector: Yoann |
| L3a   | `/en` and `/fr` URLs, language from the browser, visible switch, `hreflang` | In review              |
| L3    | Front end from the mockup; content entered through the MCP server           | Waits for the mockup   |
| L4    | Demos, in batches                                                           | To do                  |
| L5    | Lighthouse, repository public, DNS switched to Vercel                       | Yoann's go             |

## 2. Owed by Yoann

- Supabase project created (ADR-3) and `ENABLE_MCP`, `SITE_URL` set in Vercel (Production) by the
  session. Secrets are Yoann's to set, never routed through a session: the `site_payload`
  password (SQL editor, `alter role`), then `DATABASE_URL` (transaction pooler, user
  `site_payload.pgmqmjpaltifcjzegksu`), `PAYLOAD_SECRET`, `MCP_OAUTH_SIGNING_KEY`
  (`.env.example`). Turn the Data API off in the dashboard.
- `SITE_URL` is the `vercel.app` URL until the DNS switch (L5), then `https://yoann.coumes-gauchet.fr`.
- Create the administrator account **before** the deployment URL is shared or reachable: Payload
  lets the first visitor of an empty `users` table create it.
- Add the MCP connector in claude.ai (L2b).
- Switch the DNS of `yoann.coumes-gauchet.fr` from Figma to Vercel (L5).

## 3. Open questions for Yoann

- None open on this batch. Visual direction and texts: a new Claude Design pass after the
  message platform is settled (Yoann's project files, `synthese/branding/07-plateforme-de-message.md`);
  the "1A" mockup is not the one kept.

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
- 2026-10-20: hostile review of L2. Fixed: a confirmation could delete a document restored since
  the request; MCP edits of a published page went live (now drafts, ADR-2 §3); thrown or refused
  tool calls escaped the journal; `users` and connections relied on the tool filter alone (now a
  second lock); no anti-framing header; `payload-llm-instructions` removed (`llmInstructions:
  false`) rather than accepted public; loopback ports above 65535. Rejected or deferred findings
  are listed on PR #1. Supabase project created in Yoann's free organisation.
- 2026-10-20: production live on `yoann-coumes-gauchet.vercel.app` (cdg1); Yoann created the
  admin account, added the connector in claude.ai (one `getConfigInfo` call from a session: the
  four collections and `site`, nothing else) and turned the Data API off.
- 2026-10-20: L3a. `src/proxy.ts` redirects a path without language (`Accept-Language`, then the
  `locale` cookie written by the switch, else English); pages live under `[locale]`, read with
  `fallbackLocale: false`; a page published in one language only redirects there; `hreflang`
  lists only published languages. Mutations seen red: listed on the PR.
