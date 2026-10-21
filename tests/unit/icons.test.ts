import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const app = path.join(process.cwd(), 'src/app')
const styles = readFileSync(path.join(app, '(frontend)/[locale]/styles.css'), 'utf8')
const accent = styles.match(/--acc:\s*(#[0-9a-f]{6})/i)?.[1]?.toLowerCase()

describe('site icons', () => {
  it('holds a real ICO, SVG and PNG where Next looks for them', () => {
    for (const file of ['favicon.ico', 'icon.svg', 'apple-icon.png']) {
      expect(existsSync(path.join(app, file)), file).toBe(true)
    }
    expect([...readFileSync(path.join(app, 'favicon.ico')).subarray(0, 4)]).toEqual([0, 0, 1, 0])
    expect([...readFileSync(path.join(app, 'apple-icon.png')).subarray(0, 4)]).toEqual([
      0x89, 0x50, 0x4e, 0x47,
    ])
  })

  it('leaves the icons to the files: no page metadata sets its own', () => {
    // Metadata `icons` replaces the file-based icon and apple-icon on every page it reaches.
    const frontend = path.join(app, '(frontend)')
    const sources = readdirSync(frontend, { recursive: true, encoding: 'utf8' }).filter((file) =>
      /\.tsx?$/.test(file),
    )
    for (const file of sources) {
      expect(readFileSync(path.join(frontend, file), 'utf8'), file).not.toMatch(/\bicons\s*:/)
    }
  })

  it("draws the header's mark in the site's accent colour", () => {
    expect(accent).toBeDefined()
    expect(readFileSync(path.join(app, 'icon.svg'), 'utf8').toLowerCase()).toContain(
      `fill="${accent}"`,
    )
  })
})
