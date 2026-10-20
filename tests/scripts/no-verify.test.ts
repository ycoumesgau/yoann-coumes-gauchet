import { describe, expect, it } from 'vitest'

import { noVerifyRefusal } from '../../scripts/claude-hooks/no-verify.mjs'

const refused = [
  'git push --no-verify',
  'git commit --no-verify -m "x"',
  'git commit -n -m "x"',
  'git commit -anm "x"',
  'git push origin main --no-verif',
  'git push --no-v',
  'git -c core.hooksPath=/dev/null push',
  'git config core.hooksPath /dev/null',
  'bash -c "git push --no-verify"',
  "sh -c 'git commit --no-verify'",
  'bash <<EOF\ngit push --no-verify\nEOF',
  'cd repo && git push --no-verify',
]

const allowed = [
  'git push -u origin main',
  'git push -n',
  'git commit --amend --no-edit',
  'git commit -m "explain why --no-verify is refused"',
  "git commit -m 'git push --no-verify is refused'",
  'git commit -F - <<EOF\nDo not use --no-verify\nEOF',
  'echo "git -c core.hooksPath=x"',
  'pnpm test',
]

describe('no-verify hook', () => {
  it.each(refused)('refuses %j', (command) => {
    expect(noVerifyRefusal(command)).not.toBeNull()
  })

  it.each(allowed)('allows %j', (command) => {
    expect(noVerifyRefusal(command)).toBeNull()
  })

  it('ignores a missing command', () => {
    expect(noVerifyRefusal(undefined)).toBeNull()
  })
})
