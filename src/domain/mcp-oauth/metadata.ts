import { MCP_SIGNING_ALGORITHM, type McpOAuthConfig } from './config'

/**
 * Discovery documents: RFC 8414 for the authorization server, RFC 9728 for the
 * protected resource. Built from the configuration only, never from the request.
 * What is absent is refused: no `registration_endpoint` (no dynamic
 * registration), no CIMD, no PKCE method but S256, no client authentication.
 */
export const authorizationServerMetadata = (config: McpOAuthConfig) => ({
  issuer: config.issuer,
  authorization_endpoint: `${config.issuer}/oauth/authorize`,
  token_endpoint: `${config.issuer}/oauth/token`,
  response_types_supported: ['code'],
  grant_types_supported: ['authorization_code', 'refresh_token'],
  code_challenge_methods_supported: ['S256'],
  token_endpoint_auth_methods_supported: ['none'],
  authorization_response_iss_parameter_supported: true,
  scopes_supported: [] as string[],
})

export const protectedResourceMetadata = (config: McpOAuthConfig) => ({
  resource: config.resource,
  authorization_servers: [config.issuer],
  bearer_methods_supported: ['header'],
  resource_signing_alg_values_supported: [MCP_SIGNING_ALGORITHM],
  resource_name: 'yoann.coumes-gauchet.fr',
})

/** RFC 9728 §3.1: the well-known segment is inserted before the resource path. */
export const protectedResourceMetadataUrl = (config: McpOAuthConfig): string =>
  `${config.issuer}/.well-known/oauth-protected-resource${new URL(config.resource).pathname}`
