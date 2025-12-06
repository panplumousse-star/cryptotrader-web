import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'CryptoTrader',
    template: '%s - CryptoTrader',
  },
  description: 'Plateforme de trading de cryptomonnaies avec bot algorithmique et machine learning',
  keywords: ['crypto', 'trading', 'bitcoin', 'ethereum', 'bot', 'algorithmic trading'],
  authors: [{ name: 'CryptoTrader' }],
  openGraph: {
    title: 'CryptoTrader',
    description: 'Plateforme de trading de cryptomonnaies',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
