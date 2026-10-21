import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const app = path.join(process.cwd(), 'src/app')
const styles = readFileSync(path.join(app, '(frontend)/[locale]/styles.css'), 'utf8')
const accent = styles.match(/--acc:\s*(#[0-9a-f]{6})/i)?.[1]?.toLowerCase()

describe('site icons', () => {
  it('serves the favicon, the SVG icon and the Apple icon through Next file conventions', () => {
    for (const file of ['favicon.ico', 'icon.svg', 'apple-icon.png']) {
      expect(existsSync(path.join(app, file)), file).toBe(true)
    }
  })

  it("draws the header's mark in the site's accent colour", () => {
    expect(accent).toBeDefined()
    expect(readFileSync(path.join(app, 'icon.svg'), 'utf8').toLowerCase()).toContain(
      `fill="${accent}"`,
    )
  })
})
