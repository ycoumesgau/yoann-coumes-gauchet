#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook (Bash): refuses the ways around the git hooks
 * that fit in one command line: `git commit|push --no-verify` (and git's
 * prefixes of it, such as `--no-verif`), `git commit -n`, and pointing
 * `core.hooksPath` elsewhere (`git -c core.hooksPath=…`, `git config core.hooksPath`).
 * `git push -n` means `--dry-run`, hence separate patterns.
 *
 * Quoted text and heredoc bodies are data (a commit message may mention the
 * flag), except when they are handed to a shell (`bash -c "…"`, `sh <<EOF`):
 * those are scanned as commands.
 *
 * What it does not prove: a Bash matcher cannot see a command written to a
 * script first, or assembled from variables. CI stays the authority.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SEGMENT = '[^\\n;&|]*'
const NO_VERIFY = '\\s--no-v(?:e(?:r(?:i(?:f(?:y)?)?)?)?)?\\b'
const COMMIT = new RegExp(
  `\\bgit\\b${SEGMENT}\\bcommit\\b${SEGMENT}(?:${NO_VERIFY}|\\s-[a-zA-Z]*n[a-zA-Z]*\\b)`,
)
const PUSH = new RegExp(`\\bgit\\b${SEGMENT}\\bpush\\b${SEGMENT}${NO_VERIFY}`)
const HOOKS_PATH = new RegExp(`\\bgit\\b${SEGMENT}\\bcore\\.hookspath\\b`, 'i')

/** Strings and heredocs handed to a shell are commands: keep their content. */
const shellPayloads = (command) => {
  const found = []
  for (const match of command.matchAll(/\b(?:ba|z|da)?sh\s+-c\s+(['"])([\s\S]*?)\1/g)) {
    found.push(match[2])
  }
  for (const match of command.matchAll(
    /\b(?:ba|z|da)?sh\b[^\n]*<<-?\s*['"]?(\w+)['"]?\n([\s\S]*?)\n\s*\1\b/g,
  )) {
    found.push(match[2])
  }
  return found
}

/** Everything else quoted is data, not options. */
const unquoted = (command) =>
  command
    .replace(/<<-?\s*['"]?(\w+)['"]?[\s\S]*?\n\s*\1\b/g, ' ')
    .replace(/'[^']*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')

const refuses = (command, depth) => {
  const bare = unquoted(command)
  if (COMMIT.test(bare) || PUSH.test(bare) || HOOKS_PATH.test(bare)) return true
  return depth < 3 && shellPayloads(command).some((inner) => refuses(inner, depth + 1))
}

export const noVerifyRefusal = (command) => {
  if (typeof command !== 'string') return null
  if (refuses(command, 0)) {
    return 'Bypassing the git hooks is refused (CLAUDE.md §5, "never bypass it"). Fix what the hook reports; `node scripts/pre-push-check.mjs` replays it on demand.'
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
