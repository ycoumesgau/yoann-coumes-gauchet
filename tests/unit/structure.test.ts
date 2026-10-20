import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(__dirname, '../..')
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

describe('repository structure', () => {
  it('pins Payload, Next and React to exact versions', () => {
    const pinned = Object.entries(pkg.dependencies).filter(
      ([name]) =>
        name === 'payload' ||
        name.startsWith('@payloadcms/') ||
        name === 'next' ||
        name.startsWith('react'),
    )
    expect(pinned.length).toBeGreaterThan(0)
    for (const [name, version] of pinned) {
      expect(version, name).toMatch(/^\d+\.\d+\.\d+(-[\w.]+)?$/)
    }
  })

  it('keeps every Payload package on the same version', () => {
    const versions = new Set(
      Object.entries(pkg.dependencies)
        .filter(([name]) => name === 'payload' || name.startsWith('@payloadcms/'))
        .map(([, version]) => version),
    )
    expect([...versions]).toHaveLength(1)
  })

  it('keeps only collection configs in src/collections, in PascalCase', () => {
    const dir = path.join(root, 'src/collections')
    for (const file of readdirSync(dir)) {
      expect(file, file).toMatch(/^[A-Z][A-Za-z]+\.ts$/)
      const source = readFileSync(path.join(dir, file), 'utf8')
      const name = file.replace(/\.ts$/, '')
      expect(source, file).toContain(`export const ${name}: CollectionConfig`)
    }
  })

  it('refuses git hooks bypass in the Claude settings', () => {
    const settings = readFileSync(path.join(root, '.claude/settings.json'), 'utf8')
    expect(settings).toContain('scripts/claude-hooks/no-verify.mjs')
  })
})
