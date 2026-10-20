#!/usr/bin/env node
// Points git at the versioned hooks in .githooks/. Silent outside a git checkout (Vercel builds).
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

if (existsSync('.git')) execSync('git config core.hooksPath .githooks')
