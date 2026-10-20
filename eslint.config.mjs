import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Payload 4 enforces access on the Local API by default. Skipping it is a
    // decision, never a convenience: only tests and migrations may do it.
    files: ['src/**/*.{ts,tsx}'],
    // The OAuth store is the only exemption: its callers have no session yet (it says why).
    ignores: ['src/migrations/**', 'src/mcp/oauth-store.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...[
          "Property[key.name='overrideAccess'][value.value=true]",
          "Property[key.value='overrideAccess'][value.value=true]",
          "Property[computed=true][key.value='overrideAccess']",
          "Property[shorthand=true][key.name='overrideAccess']",
        ].map((selector) => ({
          selector,
          message:
            'overrideAccess: true bypasses access control. Pass the caller (`user` or `req`) instead.',
        })),
      ],
    },
  },
  {
    ignores: [
      '.next/',
      'src/payload-types.ts',
      'src/migrations/',
      'src/app/(payload)/admin/importMap.js',
    ],
  },
]

export default eslintConfig
