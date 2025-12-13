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

  // 5. Allow access to public routes and authenticated users
  return NextResponse.next()
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
