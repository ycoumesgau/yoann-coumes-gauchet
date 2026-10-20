#!/usr/bin/env node
/**
 * Keeps the agent memory small. CLAUDE.md is loaded in every session: past a
 * few kilobytes it stops being read and starts being skimmed (Nexcan's grew to
 * 355 KB before it was cut back). Rules live here, stories live in docs/plans/.
 * Run by the pre-commit hook, the pre-push check, the Claude PostToolUse hook and CI.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const limits = [
  { file: 'CLAUDE.md', maxBytes: 16_000 },
  { file: 'docs/plans/site.md', maxBytes: 24_000 },
]
export const stateSection = { file: 'CLAUDE.md', heading: '## 0. Current state', maxLines: 25 }

/** `read(file)` returns the file's text, or `null` when it does not exist. */
export const memoryErrors = (read) => {
  const errors = []
  for (const { file, maxBytes } of limits) {
    const text = read(file)
    if (text === null) {
      errors.push(`${file} is missing.`)
      continue
    }
    const bytes = Buffer.byteLength(text)
    if (bytes > maxBytes) errors.push(`${file} is ${bytes} bytes, over its ${maxBytes}-byte cap.`)
  }

  const text = read(stateSection.file)
  if (text !== null) {
    const lines = text.split('\n')
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
  return errors
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  // Paths resolve from the repository, not from wherever the hook was started.
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const errors = memoryErrors((file) => {
    try {
      return readFileSync(join(root, file), 'utf8')
    } catch {
      return null
    }
  })
  if (errors.length > 0) {
    process.stderr.write(`agent memory check failed:\n- ${errors.join('\n- ')}\n`)
    process.exit(process.argv.includes('--hook') ? 2 : 1)
  }
}
