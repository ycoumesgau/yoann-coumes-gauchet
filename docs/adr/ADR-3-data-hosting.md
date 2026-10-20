# ADR-3 — Data and media on Supabase in the EU, free plan

| Status   | Date       | Decided by |
| -------- | ---------- | ---------- |
| Accepted | 2026-10-20 | Yoann      |

## Decision

- One dedicated Supabase project in an EU region, on the free plan: Postgres for Payload,
  Storage (S3-compatible) for media.
- Payload connects through Postgres only; Supabase's Data API plays no role for the site.
- Credentials live in Vercel environment variables, never in the repository.

## Implementation (2026-10-20)

- Project `yoann-coumes-gauchet` (`pgmqmjpaltifcjzegksu`), Paris (`eu-west-3`), in Yoann's own
  free organisation (the Nexcan organisation is on a paid plan).
- Payload connects as its own role, `site_payload` (no superuser, no `BYPASSRLS`), owner of the
  tables it creates. Supabase's default privileges grant `anon` and `authenticated` full rights on
  tables created by `postgres` or `supabase_admin` in `public` (read from `pg_default_acl`); they do
  not apply to tables owned by `site_payload`, so the anonymous key reaches none of them.
- The Data API is turned off in the dashboard as well: two locks, the second not in the code.
- Production deployments run `payload migrate` before building (`scripts/vercel-build.mjs`).
- Functions run in Paris (`cdg1`, `vercel.json`), next to the database: Vercel's default is
  Washington (`iad1`), which would put a transatlantic round trip on every query and process
  the data outside the EU.

## Consequences

- Free-plan limits apply (paused after inactivity, storage and egress quotas). To revisit if the
  site outgrows them.
