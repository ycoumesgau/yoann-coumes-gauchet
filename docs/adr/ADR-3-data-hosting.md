# ADR-3 — Data and media on Supabase in the EU, free plan

| Status   | Date       | Decided by |
| -------- | ---------- | ---------- |
| Accepted | 2026-10-20 | Yoann      |

## Decision

- One dedicated Supabase project in an EU region, on the free plan: Postgres for Payload,
  Storage (S3-compatible) for media.
- Payload connects through Postgres only; Supabase's Data API plays no role for the site.
- Credentials live in Vercel environment variables, never in the repository.

## Consequences

- Free-plan limits apply (paused after inactivity, storage and egress quotas). To revisit if the
  site outgrows them.
