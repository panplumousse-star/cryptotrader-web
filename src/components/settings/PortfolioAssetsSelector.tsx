'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api'
import { useSettingsStore } from '@/stores/settingsStore'
import { AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react'

interface AssetOption {
  symbol: string
  name?: string
}

export function PortfolioAssetsSelector() {
  const { portfolioVisibleAssets, setPortfolioVisibleAssets } = useSettingsStore()
  const [assetOptions, setAssetOptions] = useState<AssetOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedSet = useMemo(() => new Set(portfolioVisibleAssets), [portfolioVisibleAssets])
  const hasSelection = portfolioVisibleAssets.length > 0

  const fetchAssets = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/portfolio')
      const holdings = response.data?.holdings || []
      const options: AssetOption[] = holdings.map((holding: { symbol: string; asset?: string }) => ({
        symbol: holding.symbol,
        name: holding.asset || holding.symbol,
      }))

      setAssetOptions(options)

      // Nettoie la sélection si des actifs ne sont plus disponibles
      if (portfolioVisibleAssets.length > 0) {
        const availableSymbols = new Set(options.map((opt) => opt.symbol))
        const filteredSelection = portfolioVisibleAssets.filter((symbol) => availableSymbols.has(symbol))
        if (filteredSelection.length !== portfolioVisibleAssets.length) {
          setPortfolioVisibleAssets(filteredSelection)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger les actifs'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleAsset = (symbol: string) => {
    if (selectedSet.has(symbol)) {
      setPortfolioVisibleAssets(portfolioVisibleAssets.filter((s) => s !== symbol))
    } else {
      setPortfolioVisibleAssets([...portfolioVisibleAssets, symbol])
    }
  }

  const handleSelectAll = () => {
    if (assetOptions.length === 0) return
    setPortfolioVisibleAssets(assetOptions.map((opt) => opt.symbol))
  }

  const handleReset = () => setPortfolioVisibleAssets([])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Actifs visibles dans le portfolio</Label>
          <p className="text-sm text-muted-foreground">
            Choisissez les actifs à afficher. Liste alimentée par l&apos;endpoint <code>/portfolio</code>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading || !hasSelection}>
            Réinitialiser
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSelectAll} disabled={isLoading || assetOptions.length === 0}>
            Tout sélectionner
          </Button>
          <Button variant="ghost" size="icon" onClick={fetchAssets} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-20" />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Impossible de récupérer les actifs</AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchAssets}>
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <>
          <div className="flex flex-wrap gap-2">
            {assetOptions.map((asset) => {
              const isSelected = selectedSet.has(asset.symbol)
              return (
                <Button
                  key={asset.symbol}
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => toggleAsset(asset.symbol)}
                  className="flex items-center gap-2"
                >
                  {isSelected && <Check className="h-4 w-4" />}
                  <span>{asset.symbol}</span>
                  {asset.name && asset.name !== asset.symbol && (
                    <span className="text-xs text-muted-foreground">({asset.name})</span>
                  )}
                </Button>
              )
            })}
            {assetOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun actif récupéré pour le moment.</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={hasSelection ? 'default' : 'secondary'}>
              {hasSelection
                ? `${portfolioVisibleAssets.length} actif(s) sélectionné(s)`
                : 'Tous les actifs sont affichés'}
            </Badge>
            <span>
              {assetOptions.length > 0
                ? `${assetOptions.length} actif(s) disponible(s)`
                : 'En attente de données...'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

