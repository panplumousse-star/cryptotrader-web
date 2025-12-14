import { NextRequest, NextResponse } from 'next/server'

// 1. Define protected and public routes
const protectedRoutes = [
  '/portfolio',
  '/trading',
  '/bot',
  '/history',
  '/alerts',
  '/settings',
  '/profile',
]

const publicRoutes = ['/', '/login', '/register', '/forgot-password']

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // 2. Check if the current route is protected or public
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => path === route)

  // 3. Read the auth token from cookies
  // Zustand persist stores the token in a cookie named 'auth-storage'
  const authStorage = req.cookies.get('auth-storage')?.value

  let token: string | null = null

  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage)
      token = parsed.state?.token || null
    } catch (e) {
      // Invalid JSON in cookie, treat as not authenticated
      token = null
    }
  }

  // 4. Redirect to / if the user is not authenticated and trying to access a protected route
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  // 5. Build environment-aware URLs for CSP
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001'

  // 7. Content Security Policy (Temporarily relaxed for Next.js 16 compatibility)
  // TODO: Implement proper nonce-based CSP using Next.js experimental.csp feature
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self' ${apiUrl} ${wsUrl};
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    object-src 'none';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim()

  // 8. Create response with security headers
  const response = NextResponse.next()

  // 10. Set all security headers
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // 11. HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  // 12. Allow access to public routes and authenticated users
  return response
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$).*)',
  ],
}
