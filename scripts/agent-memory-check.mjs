#!/usr/bin/env node
/**
 * Keeps the agent memory small. CLAUDE.md is loaded in every session: past a
 * few kilobytes it stops being read and starts being skimmed (Nexcan's grew to
 * 355 KB before it was cut back). Rules live here, stories live in docs/plans/.
 * Run by the pre-commit hook, the pre-push check, the Claude PostToolUse hook and CI.
 */
import { existsSync, readFileSync } from 'node:fs'

const limits = [
  { file: 'CLAUDE.md', maxBytes: 16_000 },
  { file: 'docs/plans/site.md', maxBytes: 24_000 },
]
const stateSection = { file: 'CLAUDE.md', heading: '## 0. Current state', maxLines: 25 }

const errors = []
for (const { file, maxBytes } of limits) {
  if (!existsSync(file)) {
    errors.push(`${file} is missing.`)
    continue
  }
  const bytes = Buffer.byteLength(readFileSync(file, 'utf8'))
  if (bytes > maxBytes) errors.push(`${file} is ${bytes} bytes, over its ${maxBytes}-byte cap.`)
}

if (existsSync(stateSection.file)) {
  const lines = readFileSync(stateSection.file, 'utf8').split('\n')
  const start = lines.findIndex((line) => line.startsWith(stateSection.heading))
  if (start === -1) {
    errors.push(`${stateSection.file} has no "${stateSection.heading}" section.`)
  } else {
    const end = lines.findIndex((line, i) => i > start && line.startsWith('## '))
    const length = (end === -1 ? lines.length : end) - start - 1
    if (length > stateSection.maxLines) {
      errors.push(
        `"${stateSection.heading}" is ${length} lines; it is replaced, not extended (max ${stateSection.maxLines}).`,
      )
    }
  }
}

if (errors.length > 0) {
  process.stderr.write(`agent memory check failed:\n- ${errors.join('\n- ')}\n`)
  process.exit(process.argv.includes('--hook') ? 2 : 1)
}
