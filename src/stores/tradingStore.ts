import { create } from 'zustand'

export type OrderSide = 'buy' | 'sell'
export type OrderType = 'market' | 'limit' | 'stop_loss' | 'take_profit'
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'rejected'

export interface Order {
  id: string
  symbol: string
  side: OrderSide
  type: OrderType
  amount: number
  price?: number
  stopPrice?: number
  status: OrderStatus
  filledAmount: number
  filledPrice?: number
  createdAt: string
  updatedAt: string
}

export interface OrderBook {
  bids: [number, number][] // [price, amount]
  asks: [number, number][]
  lastUpdate: number
}

export interface Ticker {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
  volume24h: number
}

interface TradingState {
  selectedPair: string
  ticker: Ticker | null
  orderBook: OrderBook | null
  openOrders: Order[]
  isLoading: boolean
  error: string | null
  setSelectedPair: (pair: string) => void
  setTicker: (ticker: Ticker) => void
  setOrderBook: (orderBook: OrderBook) => void
  setOpenOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  removeOrder: (orderId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTradingStore = create<TradingState>((set, get) => ({
  selectedPair: 'BTC-USD',
  ticker: null,
  orderBook: null,
  openOrders: [],
  isLoading: false,
  error: null,

  setSelectedPair: (selectedPair) => set({ selectedPair }),

  setTicker: (ticker) => set({ ticker }),

  setOrderBook: (orderBook) => set({ orderBook }),

  setOpenOrders: (openOrders) => set({ openOrders }),

  addOrder: (order) => set({ openOrders: [...get().openOrders, order] }),

  updateOrder: (orderId, updates) =>
    set({
      openOrders: get().openOrders.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      ),
    }),

  removeOrder: (orderId) =>
    set({
      openOrders: get().openOrders.filter((order) => order.id !== orderId),
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}))
