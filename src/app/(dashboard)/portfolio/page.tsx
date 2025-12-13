'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Wallet, Activity, AlertCircle, Settings, RefreshCw } from 'lucide-react'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export default function PortfolioPage() {
  const { assets, summary, isLoading, error, errorCode, fetchPortfolio } = usePortfolioStore()

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

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
  const profitCount = assets.filter((a) => a.pnl > 0).length
  const lossCount = assets.filter((a) => a.pnl < 0).length
  const isPnlPositive = summary.dailyPnl >= 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
        <p className="text-muted-foreground">Vue d&apos;ensemble de votre portefeuille crypto</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <Wallet className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className={`text-xs ${summary.totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {summary.totalPnl >= 0 ? '+' : ''}
              {summary.totalPnlPercent.toFixed(2)}% depuis le début
            </p>
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
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-muted-foreground text-xs">
              {profitCount} en profit, {lossCount} en perte
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
            <CardDescription>Evolution de la valeur sur les 30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <div className="text-muted-foreground flex h-full items-center justify-center">
              Graphique de performance (à implémenter)
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
            <CardDescription>Répartition de votre portefeuille</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <div className="text-muted-foreground flex h-full items-center justify-center">
              Graphique d&apos;allocation (à implémenter)
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actifs</CardTitle>
          <CardDescription>Liste détaillée de vos positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset) => (
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
