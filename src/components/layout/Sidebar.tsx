'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Bot,
  History,
  Bell,
  Settings,
  Wallet,
  TrendingUp,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/authStore'

const navigation = [
  { name: 'Portfolio', href: '/portfolio', icon: LayoutDashboard },
  { name: 'Trading', href: '/trading', icon: TrendingUp },
  { name: 'Bot Strategies', href: '/bot/strategies', icon: Bot },
  { name: 'Historique', href: '/history', icon: History },
  { name: 'Alertes', href: '/alerts', icon: Bell },
]

const secondaryNavigation = [
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex h-screen w-64 flex-col border-r">
      <div className="flex h-16 items-center gap-2 px-6">
        <Wallet className="text-primary h-8 w-8" />
        <span className="text-xl font-bold">CryptoTrader</span>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="space-y-1 px-3 py-4">
        {secondaryNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground w-full justify-start gap-3 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </div>

      <Separator />

      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {user?.name && user.name !== user.email
              ? user.name.charAt(0).toUpperCase()
              : user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {user?.name && user.name !== user.email ? user.name : 'Utilisateur'}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.email || ''}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
