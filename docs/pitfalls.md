# Pitfalls

Measured traps, dated. A trap that changes how sessions work also gets a one-line rule in
`CLAUDE.md`.

## 2026-10-20 — Payload 4: `_status` is per locale

With localization configured, Payload 4 sets `drafts.localizeStatus` automatically
(`node_modules/payload/dist/versions/types.d.ts`). Publishing in English leaves French
unpublished, and publishing French fails ("The following field is invalid: Title") until French
has its own required fields. Observed on 4.0.0-beta.3: `findByID` in `fr` returned
`_status: 'published'` while a `find` filtered on `_status` in `fr` returned nothing; trust the
filtered query. Covered by `tests/db/pages-access.test.ts`.

## 2026-10-20 — plugin-mcp exposes every collection by default

`@payloadcms/plugin-mcp` 4.0.0-beta.3 builds tools for every collection in the config, Payload's
own included, unless each tool is set to `false`. The site filters items by a closed list in
`overrideGetAuthorizedMCP` (`src/mcp/plugin.ts`, `isExposedItem`) instead. And a Payload custom
admin view is not behind the login: the consent view enforces the session itself.

## 2026-10-20 — Node 24 is required

Payload 4 refuses Node < 24.15.0. The cloud session ships Node 22: install Node 24 before
`pnpm install`.

## 2026-10-20 — Payload 4: versions and the trash inherit `read`

Without `readVersions`, Payload 4 copies `read` onto versions and rewrites its `where`
(`node_modules/payload/dist/collections/config/defaults.js`). With `read: publishedOrAdmin`, an
anonymous caller could read every version ever published, including one corrected or
unpublished since. And the REST `find` honours `?trash=true`, which drops the "not trashed"
filter: a trashed published page stayed public. Hence `readVersions: adminOnly` and a
`deletedAt` condition in the anonymous read. Covered by `tests/db/public-surface.test.ts`.

## 2026-10-20 — Payload 4: `delete` with `trash: true` ignores the trash

`trash: true` lifts the "not trashed" filter (`collections/operations/deleteByID.js`); it does not
restrict to trashed documents. A delete meant for the trash says so in its `where`
(`deletedAt: { exists: true }`), as `DeletionRequests` does.

## 2026-10-20 — MCP plugin: `draft` defaults to `false`, `afterToolCall` skips throws

`updateDocument` writes the published row unless the call passes `draft: true`; `afterToolCall`
runs only for a handler that returns. Hence `mcpWritesAsDrafts` and the `journaled` wrapper.

## 2026-10-20 — Supabase: tables created by `postgres` are granted to `anon`

`pg_default_acl` grants `anon` and `authenticated` everything on tables `postgres` creates in
`public`. Payload connects as its own role (`site_payload`) so its tables escape those grants.

## 2026-10-20 — Supabase pooler: the user carries the role

The "Connect" string of Supabase names `postgres.<ref>`. Payload connects as `site_payload`, so
`DATABASE_URL` uses `site_payload.<ref>`. The first production build failed on exactly this
("password authentication failed for user postgres").
