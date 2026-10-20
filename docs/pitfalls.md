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
