import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Play, Pause, Settings } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Stratégies Bot',
  description: 'Gérez vos stratégies de trading automatisées',
}

const strategies = [
  {
    id: '1',
    name: 'RSI Momentum',
    pair: 'BTC/USD',
    status: 'running',
    pnl: '+12.5%',
    trades: 45,
  },
  {
    id: '2',
    name: 'MACD Crossover',
    pair: 'ETH/USD',
    status: 'running',
    pnl: '+8.3%',
    trades: 32,
  },
  {
    id: '3',
    name: 'Bollinger Breakout',
    pair: 'SOL/USD',
    status: 'paused',
    pnl: '-2.1%',
    trades: 18,
  },
]

export default function StrategiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stratégies de Trading</h2>
          <p className="text-muted-foreground">Gérez vos stratégies de trading automatisées</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Stratégie
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {strategies.map((strategy) => (
          <Card key={strategy.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{strategy.name}</CardTitle>
                <Badge variant={strategy.status === 'running' ? 'default' : 'secondary'}>
                  {strategy.status === 'running' ? 'Actif' : 'Pause'}
                </Badge>
              </div>
              <CardDescription>{strategy.pair}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">P&L</span>
                  <span
                    className={strategy.pnl.startsWith('+') ? 'text-profit' : 'text-loss'}
                  >
                    {strategy.pnl}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trades</span>
                  <span>{strategy.trades}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    {strategy.status === 'running' ? (
                      <>
                        <Pause className="mr-1 h-3 w-3" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-1 h-3 w-3" />
                        Démarrer
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
