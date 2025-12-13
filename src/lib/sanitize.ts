import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Use this function when displaying user-generated content
 *
 * @param dirty - The unsanitized HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - return empty string or plain text
    return ''
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })
}

/**
 * Strips all HTML tags and returns plain text
 * Use this for text-only contexts like input validation
 *
 * @param dirty - The string that may contain HTML
 * @returns Plain text with all HTML removed
 */
export function stripHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: simple regex strip
    return dirty.replace(/<[^>]*>/g, '')
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitizes URL to prevent javascript: and data: URL attacks
 *
 * @param url - The URL to sanitize
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  const trimmedUrl = url.trim().toLowerCase()

  // Block dangerous protocols
  if (
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('vbscript:')
  ) {
    return ''
  }

  // Allow only http, https, mailto protocols or relative URLs
  if (
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('mailto:') ||
    trimmedUrl.startsWith('/') ||
    trimmedUrl.startsWith('#')
  ) {
    return url
  }

  // Default to empty string for unknown protocols
  return ''
}
