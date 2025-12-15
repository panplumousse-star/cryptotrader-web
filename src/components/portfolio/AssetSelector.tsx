'use client'

import { useState } from 'react'
import { ChevronDown, Check, Coins, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// Chart color for single asset display (uses CSS variable directly, not wrapped in hsl())
export const ASSET_COLOR = 'var(--chart-1)'

export interface Asset {
  symbol: string
  name?: string
}

interface AssetSelectorProps {
  assets: Asset[]
  selectedAsset: string | null
  onChange: (selected: string | null) => void
  className?: string
}

export function AssetSelector({
  assets,
  selectedAsset,
  onChange,
  className,
}: AssetSelectorProps) {
  const [open, setOpen] = useState(false)

  // Get display label for current selection
  const getDisplayLabel = (): string => {
    if (selectedAsset === null) {
      return 'Portfolio'
    }
    return selectedAsset
  }

  // Handle selecting portfolio (null = show total portfolio)
  const handleSelectPortfolio = () => {
    onChange(null)
    setOpen(false)
  }

  // Handle selecting a specific asset
  const handleSelectAsset = (symbol: string) => {
    // If clicking on already selected asset, deselect it (go back to portfolio)
    if (selectedAsset === symbol) {
      onChange(null)
    } else {
      onChange(symbol)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-between gap-2 min-w-[180px] font-normal h-auto min-h-[36px] py-1.5',
            className
          )}
        >
          <div className="flex items-center gap-2">
            {selectedAsset === null ? (
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <Coins className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm">{getDisplayLabel()}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] p-0"
        align="start"
        sideOffset={8}
      >
        <div className="max-h-[300px] overflow-y-auto">
          {/* Header */}
          <div className="p-3 border-b">
            <h4 className="text-sm font-medium text-muted-foreground">
              Selectionner une vue
            </h4>
          </div>

          {/* Portfolio option (default) */}
          <div className="p-1 border-b">
            <button
              onClick={handleSelectPortfolio}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                selectedAsset === null && 'bg-accent/50'
              )}
            >
              <div
                className={cn(
                  'h-4 w-4 rounded-full border flex items-center justify-center shrink-0',
                  selectedAsset === null
                    ? 'bg-primary border-primary'
                    : 'border-input'
                )}
              >
                {selectedAsset === null && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium">Portfolio</span>
            </button>
          </div>

          {/* Asset list */}
          <div className="p-1">
            {assets.map((asset) => {
              const isSelected = selectedAsset === asset.symbol

              return (
                <button
                  key={asset.symbol}
                  onClick={() => handleSelectAsset(asset.symbol)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-accent/50'
                  )}
                >
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border flex items-center justify-center shrink-0',
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-input'
                    )}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <Coins className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-left truncate">
                    {asset.symbol}
                  </span>
                  {asset.name && asset.name !== asset.symbol && (
                    <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                      {asset.name}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* No assets message */}
          {assets.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucun actif disponible
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
