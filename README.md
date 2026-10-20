# yoann.coumes-gauchet.fr

Yoann Coumes-Gauchet's personal site. It is also a small demonstration of how he builds with
coding agents:

- **Payload 4** (beta) on **Next.js 16**, one app for the site and its admin;
- an **MCP server**, so the whole site can be managed from Claude;
- a written contract for agents (`CLAUDE.md`), decision records (`docs/adr/`), a hostile
  reviewer (`.claude/agents/`), guards that run before every push and in CI.

## Run locally

Requires Node ≥ 24.15, pnpm and a Postgres database.

```bash
cp .env.example .env   # then set DATABASE_URL and PAYLOAD_SECRET
pnpm install
pnpm db:migrate
pnpm dev               # http://localhost:3000, admin at /admin
```

Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:db`.
