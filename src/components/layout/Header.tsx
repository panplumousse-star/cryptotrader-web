'use client'

import Link from 'next/link'
import { Bell, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/hooks/useTheme'

export function Header() {
  const { toggleTheme, resolvedTheme } = useTheme()

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href="/alerts" aria-label="Voir les alertes">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
          </Link>
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Basculer vers le thème {resolvedTheme === 'dark' ? 'clair' : 'sombre'}</span>
        </Button>
      </div>
    </header>
  )
}
