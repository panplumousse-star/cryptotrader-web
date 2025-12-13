import { create } from 'zustand'
import type { PortfolioAsset, PortfolioSummary } from '@/types/api'
import { apiClient } from '@/lib/api/client'
import { AxiosError } from 'axios'

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

interface PortfolioState {
  assets: Asset[]
  summary: PortfolioSummary | null
  isLoading: boolean
  error: string | null
  errorCode: number | null
  fetchPortfolio: () => Promise<void>
  setAssets: (assets: Asset[]) => void
  setSummary: (summary: PortfolioSummary) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null, code?: number | null) => void
  updateAssetPrice: (symbol: string, price: number) => void
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  assets: [],
  summary: null,
  isLoading: false,
  error: null,
  errorCode: null,

  fetchPortfolio: async () => {
    set({ isLoading: true, error: null, errorCode: null })

    try {
      const response = await apiClient.get('/portfolio')

      // Map backend response to frontend types
      const holdings = response.data.holdings || []
      const mappedAssets: Asset[] = holdings.map((holding: any) => ({
        id: holding.symbol,
        symbol: holding.symbol,
        name: holding.name || holding.symbol,
        amount: holding.balance,
        averagePrice: 0, // Backend doesn't provide this yet
        currentPrice: holding.price_usd,
        value: holding.value_usd,
        pnl: 0, // Will be calculated when we have average price
        pnlPercent: 0,
        allocation: holding.allocation_percent,
      }))

      const summary: PortfolioSummary = {
        totalValue: response.data.summary?.total_value_usd || 0,
        totalPnl: 0, // Backend doesn't provide this yet
        totalPnlPercent: 0,
        dailyPnl: 0,
        dailyPnlPercent: 0,
      }

      set({
        assets: mappedAssets,
        summary,
        isLoading: false,
        error: null,
        errorCode: null,
      })
    } catch (error) {
      const axiosError = error as AxiosError
      const status = axiosError.response?.status
      let errorMessage = 'Une erreur est survenue lors du chargement du portfolio'

      if (status === 424) {
        errorMessage = 'Clés API Coinbase non configurées. Veuillez configurer vos clés API dans les paramètres.'
      } else if (status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.'
      } else if (axiosError.message) {
        errorMessage = axiosError.message
      }

      set({
        isLoading: false,
        error: errorMessage,
        errorCode: status || null,
      })
      throw error
    }
  },

  setAssets: (assets) => set({ assets }),

  setSummary: (summary) => set({ summary }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error, code = null) => set({ error, errorCode: code }),

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
