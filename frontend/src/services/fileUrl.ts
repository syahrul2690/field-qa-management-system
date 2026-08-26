/**
 * Build a browser-reachable URL for a file served by the frontend proxy.
 *
 * Production serves `/uploads` from the same origin as the SPA. A configured
 * API URL is still supported for local development and split deployments.
 */
export function getPublicFileUrl(filePath: string, apiUrl?: string, origin?: string): string {
  const configuredOrigin = apiUrl
    ?.replace(/\/api\/?$/, '')
    .replace(/\/+$/, '');
  const baseUrl = configuredOrigin || origin || '';
  const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\/+/, '');

  return `${baseUrl}/uploads/${normalizedPath}`;
}
