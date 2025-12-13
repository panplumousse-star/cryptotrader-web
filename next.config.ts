import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/:path*`,
      },
    ]
  },

  async headers() {
    // Build environment-aware API and WebSocket URLs
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001'

    // Extract domains for CSP connect-src directive
    const apiDomain = apiUrl.replace(/^https?:\/\//, '')
    const wsDomain = wsUrl.replace(/^wss?:\/\//, '')

    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: `
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: https:;
          font-src 'self' data:;
          connect-src 'self' ${apiUrl} ${wsUrl} ${apiDomain} ${wsDomain};
          frame-ancestors 'none';
          base-uri 'self';
          form-action 'self';
        `.replace(/\s+/g, ' ').trim()
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ]

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
