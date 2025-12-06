import { create } from 'zustand'

export interface Asset {
  id: string
  symbol: string
  name: string
  amount: number
  averagePrice: number
  currentPrice: number
  value: number
  pnl: number
  pnlPercent: number
  allocation: number
}

export interface PortfolioSummary {
  totalValue: number
  totalPnl: number
  totalPnlPercent: number
  dailyPnl: number
  dailyPnlPercent: number
}

interface PortfolioState {
  assets: Asset[]
  summary: PortfolioSummary | null
  isLoading: boolean
  error: string | null
  setAssets: (assets: Asset[]) => void
  setSummary: (summary: PortfolioSummary) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateAssetPrice: (symbol: string, price: number) => void
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  assets: [],
  summary: null,
  isLoading: false,
  error: null,

  setAssets: (assets) => set({ assets }),

  setSummary: (summary) => set({ summary }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateAssetPrice: (symbol, price) => {
    const assets = get().assets.map((asset) => {
      if (asset.symbol === symbol) {
        const value = asset.amount * price
        const pnl = value - asset.amount * asset.averagePrice
        const pnlPercent = (pnl / (asset.amount * asset.averagePrice)) * 100
        return { ...asset, currentPrice: price, value, pnl, pnlPercent }
      }
      return asset
    })
    set({ assets })
  },
}))
