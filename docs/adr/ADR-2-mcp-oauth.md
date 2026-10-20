# ADR-2 — An MCP server reachable from Claude, behind OAuth

| Status                                     | Date       | Decided by |
| ------------------------------------------ | ---------- | ---------- |
| Accepted (mechanism of §4 to settle in L2) | 2026-10-20 | Yoann      |

## Context (measured 2026-10-20)

- Yoann's requirement: from Claude, every action on the site through an MCP server, "including
  deletion, subject to my confirmation"; usable in Claude on the web, desktop and mobile, not only
  in Claude Code.
- `@payloadcms/plugin-mcp` 4.0.0-beta.3 exposes `/api/mcp` with CRUD tools per collection and
  global, custom tools, and hooks. It authenticates with a Payload API key or a custom resolver
  (`overrideGetAuthorizedMCP`). It has **no OAuth**.
- A custom connector in Claude's hosted apps authenticates with **OAuth** (DCR or CIMD, PKCE S256,
  redirect `https://claude.ai/api/mcp/auth_callback`); fixed request headers are a beta limited to
  some organisations (claude.com/docs/connectors/building/authentication). Claude Code uses a
  loopback redirect on any port.
- Nexcan already runs its own OAuth server for the same reason (its ADR-59 §4.6): authorization
  code with PKCE S256, consent as an `/admin` view, ES256 access tokens valid one hour, rotated
  refresh tokens whose reuse revokes the lineage.

## Decision

1. **Tools**: the official plugin, restricted to a closed list of collections and globals, plus
   custom tools where the generic ones fall short (publishing a locale, trash, restore).
2. **Auth**: an OAuth 2.1 server in this app, ported from Nexcan and reduced (one administrator,
   no tenants), wired into the plugin through `overrideGetAuthorizedMCP`. Every call re-checks
   that the grant still exists.
3. **Writes** land as drafts; publishing is an explicit tool call. No bulk write.
4. **Deletion**: a document goes to the trash first (reversible). Permanent deletion requires
   Yoann's confirmation outside the model's control. Mechanism settled in L2: a one-time
   confirmation link opening `/admin` (works on every Claude surface), unless MCP elicitation is
   shown to work in Claude.
5. **Audit**: every MCP write is journaled (who, what, when, before, after).
6. **Kill switch**: the endpoint answers 503 unless `ENABLE_MCP=true` and its keys are set.

## Consequences

- More code than the plugin alone, in exchange for Claude everywhere.
- The OAuth code is security-sensitive: it gets its own tests and a hostile review.
