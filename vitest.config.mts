import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// Pure tests: no database, no network. Database tests live in vitest.db.config.mts.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})
