#!/usr/bin/env node
/**
 * What Vercel runs instead of `build` (it prefers a `vercel-build` script).
 * Production applies the migrations first (CLAUDE.md §4.4: `payload migrate`
 * only), so a deployment never serves a schema its database does not have.
 * Previews have no database of their own and only build.
 */
import { execSync } from 'node:child_process'

const run = (command) => execSync(command, { stdio: 'inherit' })

if (process.env.VERCEL_ENV === 'production') run('pnpm db:migrate')
run('pnpm build')
