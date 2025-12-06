import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, Trash2 } from 'lucide-react'

const alerts = [
  {
    id: '1',
    name: 'BTC au-dessus de 50k',
    condition: 'BTC/USD > $50,000',
    status: 'active',
    triggered: false,
  },
  {
    id: '2',
    name: 'ETH en dessous de 2k',
    condition: 'ETH/USD < $2,000',
    status: 'active',
    triggered: false,
  },
  {
    id: '3',
    name: 'RSI BTC surachat',
    condition: 'BTC RSI > 70',
    status: 'triggered',
    triggered: true,
  },
]

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alertes</h2>
          <p className="text-muted-foreground">Gérez vos alertes de prix et indicateurs</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Alerte
        </Button>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell
                    className={`h-5 w-5 ${alert.triggered ? 'text-loss' : 'text-muted-foreground'}`}
                  />
                  <div>
                    <CardTitle className="text-base">{alert.name}</CardTitle>
                    <CardDescription>{alert.condition}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={alert.triggered ? 'destructive' : 'default'}>
                    {alert.triggered ? 'Déclenché' : 'Actif'}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
