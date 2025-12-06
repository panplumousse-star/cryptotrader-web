import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TradingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Trading</h2>
        <p className="text-muted-foreground">Achetez et vendez des cryptomonnaies</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[500px]">
            <CardHeader>
              <CardTitle>BTC/USD</CardTitle>
            </CardHeader>
            <CardContent className="h-[420px]">
              <div className="text-muted-foreground flex h-full items-center justify-center">
                Graphique TradingView (à implémenter)
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Passer un ordre</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="buy">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy" className="data-[state=active]:bg-profit/20">
                    Acheter
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="data-[state=active]:bg-loss/20">
                    Vendre
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="buy" className="space-y-4 pt-4">
                  <div className="text-muted-foreground text-center">
                    Formulaire d&apos;achat (à implémenter)
                  </div>
                </TabsContent>
                <TabsContent value="sell" className="space-y-4 pt-4">
                  <div className="text-muted-foreground text-center">
                    Formulaire de vente (à implémenter)
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carnet d&apos;ordres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center">
                Order book (à implémenter)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
