#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook (Bash): refuses `git commit|push --no-verify`.
 *
 * `--no-verify` is the only way around the repository's git hooks. A guard that
 * can be skipped ends up skipped: a red hook gets fixed, not bypassed.
 * `git commit -n` means `--no-verify`; `git push -n` means `--dry-run`, hence two patterns.
 *
 * What it does not prove: a Bash matcher cannot see a command built another way
 * (an intermediate script, a variable). CI stays the authority.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const COMMIT = /\bgit\b[^\n;&|]*\bcommit\b[^\n;&|]*(?:\s--no-verify\b|\s-[a-zA-Z]*n[a-zA-Z]*\b)/
const PUSH = /\bgit\b[^\n;&|]*\bpush\b[^\n;&|]*\s--no-verify\b/

/** Quoted text and heredoc bodies are data, not options: a commit message may mention the flag. */
const unquoted = (command) =>
  command
    .replace(/<<-?\s*['"]?(\w+)['"]?[\s\S]*?\n\s*\1\b/g, ' ')
    .replace(/'[^']*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')

export const noVerifyRefusal = (command) => {
  if (typeof command !== 'string') return null
  const bare = unquoted(command)
  if (COMMIT.test(bare) || PUSH.test(bare)) {
    return '`--no-verify` is refused (CLAUDE.md, "No way around the guards"). Fix what the git hook reports; `node scripts/pre-push-check.mjs` replays it on demand.'
  }
  return null
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  let input = {}
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0)
  }
  const reason = noVerifyRefusal(input?.tool_input?.command)
  if (reason) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: reason,
        },
      }),
    )
  }
  process.exit(0)
}
