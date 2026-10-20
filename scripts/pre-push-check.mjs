#!/usr/bin/env node
/**
 * What the pre-push hook runs: the checks CI would run first, so a red is found
 * here and not in CI. Prints what it does NOT cover.
 */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

if (!existsSync('node_modules')) {
  process.stderr.write('pre-push: node_modules is missing; run `pnpm install` first.\n')
  process.exit(1)
}

const steps = [
  ['agent memory', 'node scripts/agent-memory-check.mjs'],
  ['format', 'pnpm format:check'],
  ['lint', 'pnpm lint'],
  ['types', 'pnpm typecheck'],
  ['unit tests', 'pnpm test'],
]

for (const [label, command] of steps) {
  process.stdout.write(`pre-push: ${label}…\n`)
  try {
    execSync(command, { stdio: 'inherit' })
  } catch {
    process.stderr.write(`pre-push: ${label} failed. Fix it; do not bypass the hook.\n`)
    process.exit(1)
  }
}

process.stdout.write(
  'pre-push: green. Not covered here: database tests (`pnpm test:db`), migrations replayed from an empty database, `next build`. CI runs them.\n',
)
