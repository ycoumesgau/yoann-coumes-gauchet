/**
 * Closed list of the site's films: animated demonstrations written in React
 * (`src/app/(frontend)/_films/`). The CMS only places a film on a page and
 * carries its caption and source. The Nexcan films replay real captures of
 * the product on invented data; the others are drawn.
 */
export const demoKeys = [
  'wsb-funding',
  'nexcan-inventory',
  'nexcan-screening',
  'nexcan-photos',
  'recipe2video-checks',
  'hostile-review',
  'accounting-agent',
] as const

export type DemoKey = (typeof demoKeys)[number]

export const isDemoKey = (value: unknown): value is DemoKey =>
  typeof value === 'string' && (demoKeys as readonly string[]).includes(value)
