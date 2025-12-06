import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Historique',
  description: 'Consultez l\'historique de vos transactions',
}

const trades = [
  {
    id: '1',
    date: '2024-01-15 14:32',
    pair: 'BTC/USD',
    type: 'buy',
    amount: '0.05',
    price: '42,500',
    total: '$2,125.00',
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-01-15 12:15',
    pair: 'ETH/USD',
    type: 'sell',
    amount: '1.2',
    price: '2,450',
    total: '$2,940.00',
    status: 'completed',
  },
  {
    id: '3',
    date: '2024-01-14 18:45',
    pair: 'SOL/USD',
    type: 'buy',
    amount: '25',
    price: '98.50',
    total: '$2,462.50',
    status: 'completed',
  },
]

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Historique</h2>
        <p className="text-muted-foreground">Consultez l&apos;historique de vos transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
          <CardDescription>Liste de toutes vos transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Paire</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-medium">{trade.date}</TableCell>
                  <TableCell>{trade.pair}</TableCell>
                  <TableCell>
                    <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                      {trade.type === 'buy' ? 'Achat' : 'Vente'}
                    </Badge>
                  </TableCell>
                  <TableCell>{trade.amount}</TableCell>
                  <TableCell>${trade.price}</TableCell>
                  <TableCell>{trade.total}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{trade.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
