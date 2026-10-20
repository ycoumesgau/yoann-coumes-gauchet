# ADR-1 — Payload 4 beta on Next.js 16.4, one app

| Status   | Date       | Decided by |
| -------- | ---------- | ---------- |
| Accepted | 2026-10-20 | Yoann      |

## Context (measured 2026-10-20)

- npm: `payload@beta` = 4.0.0-beta.3 (published 2026-10-19), `latest` = 3.91.0.
- Payload 4 requires Next ≥ 16.4.0, Node ≥ 24.15.0, TypeScript ≥ 6.0.3 (v4 migration guide).
- Useful defaults in 4.0: the Local API enforces access by default; versions and authorship are on
  for every collection; `_status` is stored per locale when localization is configured.
- The site is a demonstration and Yoann wants to try Payload 4.

## Decision

1. Payload **4.0.0-beta.3**, every `@payloadcms/*` package on that exact version; Next 16.4.2.
2. **One Next.js app** serves the public site and `/admin`. No monorepo: Nexcan splits apps
   because it has six; this site has one.
3. Postgres adapter with `push: false`; schema changes go through committed migrations.
4. Moving to a newer beta, or to 4.0 stable, is its own PR with the full CI.

## What stays forbidden

- Version ranges (`^`, `~`) on Payload, Next or React.
- Falling back to 3.x without Yoann's decision: if a beta blocks a batch, the evidence goes to him.

## Consequences

- Beta breakage is possible between versions; the pin and the per-upgrade PR contain it.
- Knowledge of Payload 3 is not trusted by default: read the installed package first.
