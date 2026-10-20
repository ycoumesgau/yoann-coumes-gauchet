import { describe, expect, it } from 'vitest'

import { limits, memoryErrors, stateSection } from '../../scripts/agent-memory-check.mjs'

const state = (lines: number) =>
  `# T\n\n${stateSection.heading}\n${'- line\n'.repeat(lines)}\n## 1. Next\n`

const files = (overrides: Record<string, string | null>) => (file: string) =>
  file in overrides ? (overrides[file] ?? null) : 'ok'

describe('agent memory check', () => {
  it('accepts files under their caps', () => {
    expect(memoryErrors(files({ 'CLAUDE.md': state(10) }))).toEqual([])
  })

  it('refuses a file over its byte cap', () => {
    const cap = limits.find((limit) => limit.file === 'docs/plans/site.md')!.maxBytes
    const errors = memoryErrors(
      files({ 'CLAUDE.md': state(1), 'docs/plans/site.md': 'x'.repeat(cap + 1) }),
    )
    expect(errors).toHaveLength(1)
  })

  it('refuses a current-state section that grew past its line cap', () => {
    expect(memoryErrors(files({ 'CLAUDE.md': state(stateSection.maxLines + 1) }))).toHaveLength(1)
    expect(memoryErrors(files({ 'CLAUDE.md': state(stateSection.maxLines - 1) }))).toEqual([])
  })

  it('refuses a missing file or section', () => {
    expect(memoryErrors(files({ 'CLAUDE.md': null }))).toHaveLength(1)
    expect(memoryErrors(files({ 'CLAUDE.md': '# no state\n' }))).toHaveLength(1)
  })
})
