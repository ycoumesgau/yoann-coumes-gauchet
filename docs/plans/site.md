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

| Batch | Content                                                                     | Status               |
| ----- | --------------------------------------------------------------------------- | -------------------- |
| L0    | Method: CLAUDE.md, ADRs, hostile reviewer, hooks, pre-push, CI, PR template | In progress          |
| L1    | Next 16.4 + Payload 4 beta, content model, FR/EN, first migration, tests    | In progress          |
| L2a   | MCP plugin restricted, audit log, kill switch                               | To do                |
| L2b   | OAuth server (ADR-2), connector added in claude.ai, deletion confirmation   | To do                |
| L3    | Front end from the mockup; content entered through the MCP server           | Waits for the mockup |
| L4    | Demos, in batches                                                           | To do                |
| L5    | Lighthouse, repository public, DNS switched to Vercel                       | Yoann's go           |

## 2. Owed by Yoann

- Create the Supabase EU project; set `DATABASE_URL` and `PAYLOAD_SECRET` in Vercel.
- Add the MCP connector in claude.ai (L2b).
- Switch the DNS of `yoann.coumes-gauchet.fr` from Figma to Vercel (L5).

## 3. Journal

- 2026-10-20: L0 and L1 started. Content model: `pages` (blocks hero, section, project cards,
  demo, timeline), `projects`, `media`, `users`, global `site`. Mutation run: `publishedOrAdmin`
  returning `true` turns two database tests red.
