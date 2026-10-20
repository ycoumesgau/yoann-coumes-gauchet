# ADR-2 — An MCP server reachable from Claude, behind OAuth

| Status                                               | Date       | Decided by |
| ---------------------------------------------------- | ---------- | ---------- |
| Accepted: §2 and §4 (Yoann); §1, §3, §5, §6 proposed | 2026-10-20 | Yoann      |

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

Yoann's words (2026-10-20): "le MCP a la main complète, y compris sur la suppression, mais modulo
une confirmation de ma part". Points 2 and 4 carry them; 1, 3, 5 and 6 are proposals of the
first session, kept unless Yoann says otherwise.

1. **Tools** (proposed): everything an administrator does in `/admin` (create, edit, publish and
   unpublish each locale, upload media, edit the global, trash, restore), through the official
   plugin and custom tools where the generic ones fall short. Not exposed: the `users`
   collection and the OAuth collections, which are the keys, not the content.
2. **Auth**: an OAuth 2.1 server in this app, ported from Nexcan and reduced (one administrator,
   no tenants), wired into the plugin through `overrideGetAuthorizedMCP`. Every call re-checks
   that the grant still exists.
3. **Writes** (proposed) land as drafts; publishing is an explicit tool call, so a page never
   goes public as a side effect of an edit.
4. **Deletion**: a document goes to the trash first (reversible). Permanent deletion requires
   Yoann's confirmation outside the model's control. Mechanism settled in L2: a one-time
   confirmation link opening `/admin` (works on every Claude surface), unless MCP elicitation is
   shown to work in Claude.
5. **Audit** (proposed): every MCP write is journaled (who, what, when, before, after).
6. **Kill switch** (proposed): the endpoint answers 503 unless `ENABLE_MCP=true` and its keys are set.

## Consequences

- More code than the plugin alone, in exchange for Claude everywhere.
- The OAuth code is security-sensitive: it gets its own tests and a hostile review.
