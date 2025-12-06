// WebSocket message types
export type WebSocketMessageType =
  | 'ticker'
  | 'orderbook'
  | 'trade'
  | 'candle'
  | 'order_update'
  | 'portfolio_update'
  | 'bot_status'
  | 'alert'
  | 'error'

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType
  channel: string
  data: T
  timestamp: number
}

// Ticker update
export interface TickerUpdate {
  symbol: string
  price: number
  bid: number
  ask: number
  change24h: number
  changePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
}

// Order book update
export interface OrderBookUpdate {
  symbol: string
  bids: [number, number][] // [price, size]
  asks: [number, number][]
  sequence: number
}

// Trade update
export interface TradeUpdate {
  symbol: string
  tradeId: string
  price: number
  size: number
  side: 'buy' | 'sell'
  time: number
}

// Candle update
export interface CandleUpdate {
  symbol: string
  interval: string
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Order status update
export interface OrderUpdate {
  orderId: string
  status: 'pending' | 'filled' | 'partial' | 'cancelled' | 'rejected'
  filledAmount: number
  filledPrice?: number
  remainingAmount: number
  updatedAt: string
}

// Portfolio update
export interface PortfolioUpdate {
  totalValue: number
  dailyPnl: number
  dailyPnlPercent: number
  assets: {
    symbol: string
    amount: number
    value: number
  }[]
}

// Bot status update
export interface BotStatusUpdate {
  isRunning: boolean
  activeStrategies: number
  lastHeartbeat: string
  recentTrades: {
    strategyId: string
    symbol: string
    side: 'buy' | 'sell'
    amount: number
    price: number
    pnl?: number
    time: string
  }[]
}

// Alert notification
export interface AlertNotification {
  id: string
  type: 'price' | 'indicator' | 'bot' | 'system'
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  data?: Record<string, unknown>
  createdAt: string
}
