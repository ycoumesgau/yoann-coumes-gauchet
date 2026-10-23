# Plan — the site

Memory between sessions: read at the start, updated at the end. Decisions: `docs/adr/`.
The detailed brief (content, demos, Claude Design) lives in Yoann's project files.

## 0. State on 2026-10-20

- Yoann's decisions (2026-10-20): the site is a demonstration; Payload 4; an MCP server usable
  from Claude everywhere, including deletion under his confirmation; Supabase EU free plan; French
  and English; he alone decides when it goes public and when he applies to jobs. Nothing is
  published before it is ready and clean.
- Languages (Yoann, 2026-10-20): the browser's language decides, the switch is clearly visible
  in the header, any other language falls back to English. Proposed by the session in the same
  message Yoann answered "je suis ta reco": one URL per language (`/en`, `/fr`) so both are
  indexed, and the switch's choice remembered. Also the session's: a page missing in one
  language redirects to the other rather than a 404.
- Visual direction: the "1A" mockup was criticised and is not kept; a new Claude Design pass
  follows the message platform. Nothing visual is coded before it.

## 1. Batches

| Batch | Content                                                                     | Status                 |
| ----- | --------------------------------------------------------------------------- | ---------------------- |
| L0    | Method: CLAUDE.md, ADRs, hostile reviewer, hooks, pre-push, CI, PR template | Merged                 |
| L1    | Next 16.4 + Payload 4 beta, content model, FR/EN, first migration, tests    | Merged                 |
| L2a   | MCP plugin, audit log, kill switch                                          | Merged                 |
| L2b   | OAuth server (ADR-2), deletion confirmation; connector added in claude.ai   | Merged, connector live |
| L3a   | `/en` and `/fr` URLs, language from the browser, visible switch, `hreflang` | Merged                 |
| L3b   | Page blocks as plain HTML, players on click (ADR-4), media on Supabase S3   | Merged                 |
| L3c   | Players loaded with the page (ADR-4 decided by Yoann), notice field removed | Merged                 |
| L3d   | Front end from prototype v2 (Tangerine), all blocks, one migration          | In progress            |
| L3e   | Films (Nexcan captures, WSB curve, Recipe2Video, review, agents), Luma Rive | In progress            |
| L4    | Demos, in batches                                                           | To do                  |
| L5    | DNS switched (done 2026-10-21), indexing and SEO; Lighthouse, public repo   | In progress            |

## 2. Owed by Yoann

- Done on 2026-10-20: secrets in Vercel, Data API off, administrator account, connector in
  claude.ai (Yoann's messages in the project thread).
- S3 keys for Supabase Storage, before any media upload in production: wired in L3b, inactive
  until the five `S3_*` variables exist in Vercel (`.env.example`).
- Done on 2026-10-21: the CNAME of `yoann.coumes-gauchet.fr` at OVH points to Vercel; `SITE_URL`
  is `https://yoann.coumes-gauchet.fr`. Yoann re-adds the claude.ai connector at that origin.

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
- 2026-10-20: L3a. `src/proxy.ts` redirects a path without language (the `locale` cookie written
  by the switch, then `Accept-Language`, else English); pages live under `[locale]`, read with
  `fallbackLocale: false`; `decidePage`, `languageLinks` and `alternateLanguages` (pure) decide
  redirects, the switch's targets and `hreflang`. Mutations seen red: listed on the PR.
- 2026-10-20: L3b. Every block renders as plain HTML (`_blocks/render-blocks.tsx`), one `<h1>`
  per page; a third-party player loads only after a click, under a notice kept in the `site`
  global (ADR-4, proposed by the session). Media go to Supabase Storage through S3 once the five
  `S3_*` variables exist; the adapter is registered even when off, since it adds two columns to
  `media` (the hostile review caught the missing migration).
  Page structure (Yoann via the coordinator): Videos & music joins the Licorn page, without the
  Runway videos; that is content, nothing in the code changes.
- 2026-10-20: ADR-4 decided by Yoann: players load with the page, no consent step, a privacy
  page explains it (his words in the ADR; the session had stated the CNIL risk). The click gate,
  the `site.thirdPartyNotice` field and the unused video poster are removed (migration
  `direct_embeds`; both were empty in production).
- 2026-10-20: privacy page published through the MCP server (slug `privacy`, FR and EN), text
  validated by Yoann with an e-mail contact only (no postal address); `site.name` set and a
  footer link to `/privacy`. The footer now keeps `rel="me"` for absolute
  `http(s)` links only, and serves a path without a language in the page's language (`/fr/privacy`).
- 2026-10-20 (night): L3d, the site from Claude Design prototype v2, coded without Yoann's
  review at his request (merge on green CI). Tangerine kept (Yoann). Fonts self-hosted
  (`@fontsource`), no request to Google. Images reach media by `externalURL` from
  `public/import/` (the sandbox cannot reach the production upload URL), then that folder goes.
  Payload 4 fetches by URL only with `upload.pasteURL.allowList`; the list names
  `https://yoann-coumes-gauchet.vercel.app/import/*` only, and it goes with the folder, in the
  same PR (a temporary exception, not a feature).
- 2026-10-20 (night): L3e. Seventeen media, seven pages and the `site` global entered in
  production through the MCP server, EN then FR (the global's arrays are shared across locales,
  so the FR write reuses the EN row ids). Then `public/import/` and the `pasteURL` allow-list
  went, as planned; `luma.riv` stays as a test fixture (`tests/fixtures/`), read by the Luma
  test. French lines with no validated source were translated by the session and listed in the
  morning report for Yoann.
- 2026-10-21: L5, indexing. Yoann asked to drop `noindex` and to complete SEO with Payload's
  plugin. `@payloadcms/plugin-seo` replaces the hand-written `meta` group (same columns, plus a
  share image per language); an empty field falls back to the page itself (title with the site
  name, hero lead, hero image). `robots.txt` admits every crawler and keeps out `/admin`, `/api/`
  (media files excepted, for link previews) and `/oauth/`; `sitemap.xml` lists each published
  language with `hreflang`. Home carries a `Person` JSON-LD: the name and the footer's web
  profiles, nothing else. Vercel had no certificate for the domain (added in 2025, before it
  pointed there); one was issued by the API. Yoann set the 308 from the `vercel.app` domain to
  the domain in Vercel.
- 2026-10-23: live preview, asked by Yoann ("t'avais pas branché la live preview sur le cms ?",
  then "oui vas-y"). `/admin` shows a page's draft beside its form, EN or FR, at 390 and 1440 px,
  framed from `/<locale>/preview/<slug>`; the frame reloads on each save (pages have no autosave,
  so on "Save Draft" or "Publish"). The route answers 404 to anyone but a signed-in `users`
  account and reads as the caller, never past access; the public pages keep reading published
  content only. `preview` is now a reserved slug (no page used it). Framing is allowed for that
  route only, by the site's own origin; a link clicked in the preview opens that page's preview.
