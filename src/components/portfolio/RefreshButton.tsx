'use client'

import { useEffect, useCallback } from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type AutoRefreshInterval = null | 60000 | 300000 | 600000 | 3600000

export const AUTO_REFRESH_OPTIONS: { label: string; shortLabel: string; value: AutoRefreshInterval }[] = [
  { label: 'Off', shortLabel: 'Off', value: null },
  { label: '1 minute', shortLabel: '1m', value: 60000 },
  { label: '5 minutes', shortLabel: '5m', value: 300000 },
  { label: '10 minutes', shortLabel: '10m', value: 600000 },
  { label: '1 heure', shortLabel: '1h', value: 3600000 },
]

interface RefreshButtonProps {
  onRefresh: () => void
  isRefreshing: boolean
  autoRefreshInterval: AutoRefreshInterval
  onAutoRefreshChange: (interval: AutoRefreshInterval) => void
  className?: string
}

export function RefreshButton({
  onRefresh,
  isRefreshing,
  autoRefreshInterval,
  onAutoRefreshChange,
  className,
}: RefreshButtonProps) {
  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshInterval) {
      return
    }

    const intervalId = setInterval(() => {
      onRefresh()
    }, autoRefreshInterval)

    return () => {
      clearInterval(intervalId)
    }
  }, [autoRefreshInterval, onRefresh])

  // Get current interval label for tooltip
  const getCurrentIntervalLabel = useCallback((): string => {
    const option = AUTO_REFRESH_OPTIONS.find((opt) => opt.value === autoRefreshInterval)
    return option?.label || 'Off'
  }, [autoRefreshInterval])

  // Get short label for display between icon and dropdown
  const getCurrentShortLabel = useCallback((): string => {
    const option = AUTO_REFRESH_OPTIONS.find((opt) => opt.value === autoRefreshInterval)
    return option?.shortLabel || 'Off'
  }, [autoRefreshInterval])

  // Build tooltip text
  const tooltipText = autoRefreshInterval
    ? `Actualisation automatique: ${getCurrentIntervalLabel()}`
    : 'Actualiser les donnees'

  return (
    <div className={cn('flex items-center', className)}>
      {/* Main refresh button with tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-r-none border-r-0 relative"
            aria-label="Actualiser les donnees"
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                isRefreshing && 'animate-spin'
              )}
            />
            {/* Green dot indicator when auto-refresh is active */}
            {autoRefreshInterval && (
              <span
                className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"
                aria-label="Actualisation automatique active"
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>

      {/* Dropdown for auto-refresh interval selection - same height as icon button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-l-none gap-1 px-2 w-auto"
            aria-label="Options d'actualisation automatique"
          >
            <span className="text-xs text-muted-foreground">{getCurrentShortLabel()}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4}>
          <DropdownMenuLabel>Actualisation auto</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {AUTO_REFRESH_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value ?? 'off'}
              onClick={() => onAutoRefreshChange(option.value)}
              className={cn(
                'cursor-pointer',
                autoRefreshInterval === option.value && 'bg-accent font-medium'
              )}
            >
              <span className="flex items-center gap-2">
                {autoRefreshInterval === option.value && (
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                )}
                {option.label}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
