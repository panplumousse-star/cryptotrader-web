'use client'

import { useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { TrendingUp, TrendingDown, Wallet, Activity, AlertCircle, Settings, RefreshCw } from 'lucide-react'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { PerformanceChart } from '@/components/portfolio/PerformanceChart'
import { AllocationChart } from '@/components/portfolio/AllocationChart'
import { TimeRangePicker } from '@/components/portfolio/TimeRangePicker'
import { RefreshButton, type AutoRefreshInterval } from '@/components/portfolio/RefreshButton'
import { useSettingsStore } from '@/stores/settingsStore'

export default function PortfolioPage() {
  const {
    assets,
    summary,
    isLoading,
    error,
    errorCode,
    fetchPortfolio,
    performance,
    performanceLoading,
    performanceError,
    timeRange,
    setTimeRange,
    fetchPerformance,
    showZeroValueAssets,
    toggleZeroValueAssets,
    // Asset selection state (single-select)
    selectedAsset,
    setSelectedAsset,
    assetPerformanceData,
    assetPerformanceLoading,
    // Chart type state
    chartType,
    setChartType,
  } = usePortfolioStore()
  const {
    portfolioVisibleAssets,
    hasLoadedUserSettings,
    userSettingsLoading,
    fetchUserSettings,
    portfolioChartPreferences,
    savePortfolioChartPreferences,
  } = useSettingsStore()

  // Filter assets based on showZeroValueAssets toggle
  const filteredAssets = useMemo(() => {
    if (showZeroValueAssets) {
      return assets
    }
    return assets.filter((asset) => asset.value > 0)
  }, [assets, showZeroValueAssets])

  // Apply user selection from paramètres (when non vide)
  const visibleAssets = useMemo(() => {
    if (!portfolioVisibleAssets.length) {
      return filteredAssets
    }
    const selection = new Set(portfolioVisibleAssets)
    return filteredAssets.filter((asset) => selection.has(asset.symbol))
  }, [filteredAssets, portfolioVisibleAssets])

  useEffect(() => {
    fetchPortfolio()
    fetchPerformance()
  }, [fetchPortfolio, fetchPerformance])

  useEffect(() => {
    if (!hasLoadedUserSettings && !userSettingsLoading) {
      fetchUserSettings()
    }
  }, [fetchUserSettings, hasLoadedUserSettings, userSettingsLoading])

  // Track whether we've already applied the initial preferences
  const hasAppliedPreferences = useRef(false)

  // Apply loaded chart preferences from settings on mount (after user settings are loaded)
  useEffect(() => {
    if (hasLoadedUserSettings && portfolioChartPreferences && !hasAppliedPreferences.current) {
      hasAppliedPreferences.current = true

      // Apply chart type preference
      if (portfolioChartPreferences.chartType) {
        setChartType(portfolioChartPreferences.chartType)
      }

      // Apply time range preference (only for relative ranges)
      if (
        portfolioChartPreferences.timeRange?.type === 'relative' &&
        portfolioChartPreferences.timeRange?.relativeValue
      ) {
        setTimeRange({
          type: 'relative',
          relativeValue: portfolioChartPreferences.timeRange.relativeValue,
        })
      }
    }
  }, [hasLoadedUserSettings, portfolioChartPreferences, setChartType, setTimeRange])

  // Wrapped handler for chart type changes - saves preference
  const handleChartTypeChange = useCallback(
    (type: 'area' | 'bar') => {
      setChartType(type)
      savePortfolioChartPreferences({
        chartType: type,
        timeRange: {
          type: timeRange.type,
          relativeValue: timeRange.relativeValue,
        },
        autoRefreshInterval: portfolioChartPreferences?.autoRefreshInterval ?? null,
      })
    },
    [setChartType, savePortfolioChartPreferences, timeRange, portfolioChartPreferences]
  )

  // Wrapped handler for time range changes - saves preference (only for relative ranges)
  const handleTimeRangeChange = useCallback(
    (range: typeof timeRange) => {
      setTimeRange(range)
      // Only save relative time ranges (absolute ranges are session-specific)
      if (range.type === 'relative') {
        savePortfolioChartPreferences({
          chartType,
          timeRange: {
            type: range.type,
            relativeValue: range.relativeValue,
          },
          autoRefreshInterval: portfolioChartPreferences?.autoRefreshInterval ?? null,
        })
      }
    },
    [setTimeRange, savePortfolioChartPreferences, chartType, portfolioChartPreferences]
  )

  // Handler for manual refresh - refreshes portfolio and performance data
  const handleRefresh = useCallback(() => {
    fetchPortfolio()
    fetchPerformance()
  }, [fetchPortfolio, fetchPerformance])

  // Handler for auto-refresh interval changes - saves preference
  const handleAutoRefreshChange = useCallback(
    (interval: AutoRefreshInterval) => {
      savePortfolioChartPreferences({
        chartType,
        timeRange: {
          type: timeRange.type,
          relativeValue: timeRange.relativeValue,
        },
        autoRefreshInterval: interval,
      })
    },
    [savePortfolioChartPreferences, chartType, timeRange]
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground">Vue d&apos;ensemble de votre portefeuille crypto</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px] mb-2" />
                <Skeleton className="h-3 w-[160px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    const is424Error = errorCode === 424
    const retryFetch = async () => {
      try {
        await fetchPortfolio()
      } catch (err) {
        // Error already handled by store
      }
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground">Vue d&apos;ensemble de votre portefeuille crypto</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{error}</p>
            <div className="flex gap-2">
              {is424Error ? (
                <Button asChild variant="default" size="sm">
                  <Link href="/settings?tab=api">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurer les clés API
                  </Link>
                </Button>
              ) : (
                <Button onClick={retryFetch} variant="default" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Empty state
  if (!summary || assets.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground">Vue d&apos;ensemble de votre portefeuille crypto</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Portfolio vide</AlertTitle>
          <AlertDescription>
            Vous n&apos;avez pas encore d&apos;actifs dans votre portefeuille.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Success state with data
  const profitCount = visibleAssets.filter((a) => a.pnl > 0).length
  const lossCount = visibleAssets.filter((a) => a.pnl < 0).length
  const isPnlPositive = summary?.dailyPnl ? summary.dailyPnl >= 0 : true
  const hiddenAssetsCount = assets.length - filteredAssets.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground">Vue d&apos;ensemble de votre portefeuille crypto</p>
        </div>
        <div className="flex items-center gap-2">
          <TimeRangePicker value={timeRange} onChange={handleTimeRangeChange} />
          <RefreshButton
            onRefresh={handleRefresh}
            isRefreshing={isLoading || performanceLoading}
            autoRefreshInterval={portfolioChartPreferences?.autoRefreshInterval ?? null}
            onAutoRefreshChange={handleAutoRefreshChange}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <Wallet className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Current Value - Main Display */}
            <div>
              <div className="text-2xl font-bold">
                ${summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Valeur actuelle</p>
            </div>

            {/* Range Performance Section */}
            {performance && (
              <div className="pt-2 border-t space-y-1">
                {/* Start value of range */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Debut range:</span>
                  <span className="font-medium">
                    ${performance.start_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* P&L on range */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">P&L range:</span>
                  <span className={`font-medium ${performance.total_pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {performance.total_pnl >= 0 ? '+' : ''}${Math.abs(performance.total_pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({performance.total_pnl_percent >= 0 ? '+' : ''}{performance.total_pnl_percent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )}

            {/* All-time Performance */}
            <div className="flex justify-between items-center text-xs pt-2 border-t">
              <span className="text-muted-foreground">All-time:</span>
              <span className={`font-medium ${summary.changeSinceStart >= 0 ? 'text-profit' : 'text-loss'}`}>
                {summary.changeSinceStart >= 0 ? '+' : ''}${Math.abs(summary.changeSinceStart).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({summary.changeSinceStartPercent >= 0 ? '+' : ''}{summary.changeSinceStartPercent.toFixed(2)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P&L Journalier</CardTitle>
            {isPnlPositive ? (
              <TrendingUp className="text-profit h-4 w-4" />
            ) : (
              <TrendingDown className="text-loss h-4 w-4" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPnlPositive ? 'text-profit' : 'text-loss'}`}>
              {isPnlPositive ? '+' : ''}${Math.abs(summary.dailyPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-muted-foreground text-xs">
              {isPnlPositive ? '+' : ''}{summary.dailyPnlPercent.toFixed(2)}% aujourd&apos;hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions Actives</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAssets.length}</div>
            <p className="text-muted-foreground text-xs">
              {profitCount} en profit, {lossCount} en perte
              {hiddenAssetsCount > 0 && !showZeroValueAssets && ` (${hiddenAssetsCount} masques)`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P&L Total</CardTitle>
            {summary.totalPnl >= 0 ? (
              <TrendingUp className="text-profit h-4 w-4" />
            ) : (
              <TrendingDown className="text-loss h-4 w-4" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {summary.totalPnl >= 0 ? '+' : ''}${Math.abs(summary.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-muted-foreground text-xs">
              {summary.totalPnl >= 0 ? '+' : ''}{summary.totalPnlPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance du Portfolio</CardTitle>
            <CardDescription>Evolution de la valeur de votre portefeuille</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <PerformanceChart
              data={performance}
              isLoading={performanceLoading}
              error={performanceError}
              onRetry={() => fetchPerformance()}
              timeRange={timeRange}
              availableAssets={visibleAssets}
              selectedAsset={selectedAsset}
              onSelectedAssetChange={setSelectedAsset}
              assetPerformanceData={assetPerformanceData}
              assetPerformanceLoading={assetPerformanceLoading}
              chartType={chartType}
              onChartTypeChange={handleChartTypeChange}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
            <CardDescription>Repartition de votre portefeuille</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <AllocationChart assets={visibleAssets} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Actifs</CardTitle>
            <CardDescription>Liste detaillee de vos positions</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-zero-assets"
              checked={showZeroValueAssets}
              onCheckedChange={toggleZeroValueAssets}
            />
            <Label htmlFor="show-zero-assets" className="text-sm text-muted-foreground cursor-pointer">
              Afficher les actifs a 0
            </Label>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleAssets.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Aucun actif ne correspond à votre sélection actuelle.
              </div>
            )}
            {visibleAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex-1">
                  <div className="font-medium">{asset.symbol}</div>
                  <div className="text-muted-foreground text-sm">{asset.name}</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium">{asset.amount.toFixed(8)}</div>
                  <div className="text-muted-foreground text-sm">
                    ${asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium">
                    ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {asset.allocation.toFixed(2)}%
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <div className={`font-medium ${asset.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {asset.pnl >= 0 ? '+' : ''}${Math.abs(asset.pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-sm ${asset.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {asset.pnl >= 0 ? '+' : ''}{asset.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
