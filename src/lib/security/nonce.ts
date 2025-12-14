import { headers } from 'next/headers'

/**
 * Get the CSP nonce from request headers
 *
 * The nonce is generated in middleware.ts and passed via x-nonce header
 * This nonce must be used in all inline scripts and styles to comply with strict CSP
 *
 * @returns The nonce string or undefined if not available
 */
export async function getNonce(): Promise<string | undefined> {
  const headersList = await headers()
  return headersList.get('x-nonce') || undefined
}
