import type { Metadata } from 'next'
import { Wallet } from 'lucide-react'

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="mb-8 flex items-center gap-2">
        <Wallet className="text-primary h-10 w-10" />
        <span className="text-2xl font-bold">CryptoTrader</span>
      </div>
      {children}
    </div>
  )
}
