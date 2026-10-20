import { exportJWK, generateKeyPair } from 'jose'

import { loadMcpOAuthConfig, type McpOAuthConfig } from '@/domain/mcp-oauth/config'

/** A throwaway signing key and the environment that opens the MCP server in tests. */
export const testMcpEnv = async (kid = 'test-key'): Promise<Record<string, string>> => {
  const { privateKey } = await generateKeyPair('ES256', { extractable: true })
  const jwk = { ...(await exportJWK(privateKey)), kid }
  return {
    ENABLE_MCP: 'true',
    SITE_URL: 'http://localhost:3000',
    MCP_OAUTH_SIGNING_KEY: JSON.stringify(jwk),
  }
}

export const testMcpConfig = async (kid?: string): Promise<McpOAuthConfig> => {
  const loaded = await loadMcpOAuthConfig(await testMcpEnv(kid))
  if (!loaded.ok) throw new Error(`test config closed: ${loaded.reason}`)
  return loaded.config
}
