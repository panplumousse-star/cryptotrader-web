import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Vue d\'ensemble de votre portefeuille crypto',
}

export default function PortfolioPage() {
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
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-muted-foreground text-xs">+20.1% depuis le mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P&L Journalier</CardTitle>
            <TrendingUp className="text-profit h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-profit text-2xl font-bold">+$1,234.56</div>
            <p className="text-muted-foreground text-xs">+2.5% aujourd&apos;hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions Actives</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">8 en profit, 4 en perte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Actif</div>
            <p className="text-muted-foreground text-xs">3 stratégies en cours</p>
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
    </div>
  )
}
