import { create } from 'zustand'
import type { PortfolioAsset, PortfolioSummary } from '@/types/api'
import { apiClient } from '@/lib/api/client'
import { AxiosError } from 'axios'

// Time range types for Grafana-style picker
export interface TimeRange {
  type: 'relative' | 'absolute'
  relativeValue?: string  // '5m', '15m', '30m', '1h', '3h', '6h', '12h', '1D', '2d', '1W', '1M', '3M', '6M', '1Y', 'ALL'
  from?: Date
  to?: Date
}

// Backend API response types
interface BackendHolding {
  symbol: string
  asset?: string
  quantity?: number
  avg_cost?: number
  current_price?: number
  value?: number
  pnl?: number
  pnl_percent?: number
  allocation_percent?: number
}

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

// Performance types
export interface PerformanceDataPoint {
  timestamp: string
  value: number
  pnl: number
  pnl_percent: number
}

export type DataSource = 'historical' | 'no_data'

export interface PerformanceData {
  period: string
  start_value: number
  end_value: number
  total_pnl: number
  total_pnl_percent: number
  data_points: PerformanceDataPoint[]
  data_source: DataSource
  snapshot_count: number
}

export type PerformancePeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

export type ChartType = 'area' | 'bar'

// Asset performance response type (single-asset or multi-asset comparison)
export interface AssetPerformanceDataPoint {
  timestamp: string
  value?: number // Explicit value field for single-asset mode
  [symbol: string]: string | number | undefined // Dynamic keys for each asset's value (multi-asset mode)
}

export interface AssetPerformanceResponse {
  period: string
  data_points: AssetPerformanceDataPoint[]
  assets: {
    symbol: string
    start_value: number
    end_value: number
    pnl_percent: number
  }[]
  // Data source info (same as portfolio performance)
  data_source?: DataSource
  snapshot_count?: number
}

interface PortfolioState {
  assets: Asset[]
  summary: PortfolioSummary | null
  isLoading: boolean
  error: string | null
  errorCode: number | null
  // Performance state
  performance: PerformanceData | null
  performanceLoading: boolean
  performanceError: string | null
  performancePeriod: PerformancePeriod
  // Time range state (Grafana-style picker)
  timeRange: TimeRange
  // Asset selection state (single-select: null = portfolio, string = specific asset)
  selectedAsset: string | null
  assetPerformanceData: AssetPerformanceResponse | null
  assetPerformanceLoading: boolean
  // Filter state
  showZeroValueAssets: boolean
  // Chart type state
  chartType: ChartType
  fetchPortfolio: () => Promise<void>
  fetchPerformance: (period?: PerformancePeriod, timeRange?: TimeRange) => Promise<void>
  setPerformancePeriod: (period: PerformancePeriod) => void
  setTimeRange: (range: TimeRange) => void
  setSelectedAsset: (asset: string | null) => void
  fetchAssetPerformance: (symbol: string | null) => Promise<void>
  setAssets: (assets: Asset[]) => void
  setSummary: (summary: PortfolioSummary) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null, code?: number | null) => void
  updateAssetPrice: (symbol: string, price: number) => void
  toggleZeroValueAssets: () => void
  setChartType: (type: ChartType) => void
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  assets: [],
  summary: null,
  isLoading: false,
  error: null,
  errorCode: null,
  // Performance initial state
  performance: null,
  performanceLoading: false,
  performanceError: null,
  performancePeriod: '1M',
  // Time range initial state (default: 30 derniers jours)
  timeRange: {
    type: 'relative',
    relativeValue: '1M',
  },
  // Asset selection initial state (null = show total portfolio)
  selectedAsset: null,
  assetPerformanceData: null,
  assetPerformanceLoading: false,
  // Filter initial state
  showZeroValueAssets: false,
  // Chart type initial state
  chartType: 'area',

  fetchPortfolio: async () => {
    set({ isLoading: true, error: null, errorCode: null })

    try {
      const response = await apiClient.get('/portfolio')

      // Map backend response to frontend types
      const holdings = response.data.holdings || []
      const mappedAssets: Asset[] = holdings.map((holding: BackendHolding) => ({
        id: holding.symbol,
        symbol: holding.symbol,
        name: holding.asset || holding.symbol,
        amount: holding.quantity || 0,
        averagePrice: holding.avg_cost || 0,
        currentPrice: holding.current_price || 0,
        value: holding.value || 0,
        pnl: holding.pnl || 0,
        pnlPercent: holding.pnl_percent || 0,
        allocation: holding.allocation_percent || 0,
      }))

      const summary: PortfolioSummary = {
        totalValue: response.data.summary?.total_value || 0,
        totalPnl: response.data.summary?.total_pnl || 0,
        totalPnlPercent: response.data.summary?.total_pnl_percent || 0,
        dailyPnl: 0, // Not provided by backend yet
        dailyPnlPercent: 0, // Not provided by backend yet
        changeSinceStart: response.data.summary?.change_since_start || 0,
        changeSinceStartPercent: response.data.summary?.change_since_start_percent || 0,
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

  fetchPerformance: async (period?: PerformancePeriod, timeRange?: TimeRange) => {
    const currentTimeRange = timeRange || get().timeRange
    set({ performanceLoading: true, performanceError: null })

    try {
      // Build query params based on time range type
      let queryParams = ''

      if (currentTimeRange.type === 'absolute' && currentTimeRange.from && currentTimeRange.to) {
        // Absolute time range: send from/to dates
        const fromISO = currentTimeRange.from.toISOString()
        const toISO = currentTimeRange.to.toISOString()
        queryParams = `from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`
      } else {
        // Relative time range: send period
        const selectedPeriod = period || currentTimeRange.relativeValue || get().performancePeriod
        queryParams = `period=${selectedPeriod}`
      }

      const response = await apiClient.get(`/portfolio/performance?${queryParams}`)

      const performanceData: PerformanceData = {
        period: response.data.period || currentTimeRange.relativeValue || 'custom',
        start_value: response.data.start_value || 0,
        end_value: response.data.end_value || 0,
        total_pnl: response.data.total_pnl || 0,
        total_pnl_percent: response.data.total_pnl_percent || 0,
        data_points: response.data.data_points || [],
        data_source: response.data.data_source || 'no_data',
        snapshot_count: response.data.snapshot_count || 0,
      }

      set({
        performance: performanceData,
        performanceLoading: false,
        performanceError: null,
        performancePeriod: (currentTimeRange.relativeValue as PerformancePeriod) || get().performancePeriod,
        timeRange: currentTimeRange,
      })
    } catch (error) {
      const axiosError = error as AxiosError
      const status = axiosError.response?.status
      let errorMessage = 'Erreur lors du chargement des performances'

      if (status === 424) {
        errorMessage = 'Cles API Coinbase non configurees'
      } else if (status === 401) {
        errorMessage = 'Session expiree'
      } else if (axiosError.message) {
        errorMessage = axiosError.message
      }

      set({
        performanceLoading: false,
        performanceError: errorMessage,
      })
    }
  },

  setPerformancePeriod: (period: PerformancePeriod) => {
    set({ performancePeriod: period })
    get().fetchPerformance(period)
  },

  setTimeRange: (range: TimeRange) => {
    set({ timeRange: range })
    get().fetchPerformance(undefined, range)
    // Also refresh asset performance if an asset is currently selected
    const selectedAsset = get().selectedAsset
    if (selectedAsset !== null) {
      get().fetchAssetPerformance(selectedAsset)
    }
  },

  setSelectedAsset: (selectedAsset: string | null) => {
    set({ selectedAsset })
    // If an asset is selected, fetch its performance data
    if (selectedAsset !== null) {
      get().fetchAssetPerformance(selectedAsset)
    } else {
      // Clear asset performance data when no asset selected (show portfolio)
      set({ assetPerformanceData: null })
    }
  },

  fetchAssetPerformance: async (symbol: string | null) => {
    if (symbol === null) {
      set({ assetPerformanceData: null, assetPerformanceLoading: false })
      return
    }

    const currentTimeRange = get().timeRange
    set({ assetPerformanceLoading: true })

    try {
      // Build query params for single asset
      let queryParams = `symbols=${symbol}`

      if (currentTimeRange.type === 'absolute' && currentTimeRange.from && currentTimeRange.to) {
        const fromISO = currentTimeRange.from.toISOString()
        const toISO = currentTimeRange.to.toISOString()
        queryParams += `&from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`
      } else {
        const period = currentTimeRange.relativeValue || get().performancePeriod
        queryParams += `&period=${period}`
      }

      const response = await apiClient.get(`/portfolio/performance/assets?${queryParams}`)

      // Map backend response to frontend interface
      const rawAssets = response.data.assets || []
      const assetData = rawAssets.find((a: { symbol: string }) => a.symbol === symbol)

      if (assetData && assetData.data_points?.length > 0) {
        // Transform data_points for single asset
        // Format: { timestamp, value } - where 'value' is the key used by the LineChart
        const dataPoints: AssetPerformanceDataPoint[] = assetData.data_points.map(
          (dp: { timestamp: string; value: number }) => ({
            timestamp: dp.timestamp,
            value: dp.value,
          })
        )

        const assetPerformanceData: AssetPerformanceResponse = {
          period: response.data.period || currentTimeRange.relativeValue || 'custom',
          data_points: dataPoints,
          assets: [{
            symbol: assetData.symbol,
            start_value: assetData.start_value || 0,
            end_value: assetData.end_value || 0,
            pnl_percent: assetData.pnl_percent ?? assetData.total_pnl_percent ?? 0,
          }],
          // Include data source info from backend
          data_source: response.data.data_source || 'historical',
          snapshot_count: response.data.snapshot_count || dataPoints.length,
        }

        set({
          assetPerformanceData,
          assetPerformanceLoading: false,
        })
      } else {
        set({
          assetPerformanceData: null,
          assetPerformanceLoading: false,
        })
      }
    } catch (error) {
      // Fallback: generate mock data from existing portfolio assets
      const assets = get().assets
      const selectedAssetData = assets.find((a) => a.symbol === symbol)

      if (selectedAssetData) {
        // Generate simple mock performance data for single asset
        const mockDataPoints: AssetPerformanceDataPoint[] = []
        const now = new Date()
        const periods = 30 // 30 data points

        for (let i = periods; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)

          // Simulate value variation based on current price
          const variation = 1 + (Math.random() - 0.5) * 0.1 * (i / periods)
          const value = selectedAssetData.currentPrice * variation

          mockDataPoints.push({
            timestamp: date.toISOString(),
            value: value,
          })
        }

        set({
          assetPerformanceData: {
            period: currentTimeRange.relativeValue || '1M',
            data_points: mockDataPoints,
            assets: [{
              symbol: selectedAssetData.symbol,
              start_value: selectedAssetData.currentPrice * 0.95,
              end_value: selectedAssetData.currentPrice,
              pnl_percent: selectedAssetData.pnlPercent,
            }],
          },
          assetPerformanceLoading: false,
        })
      } else {
        set({
          assetPerformanceData: null,
          assetPerformanceLoading: false,
        })
      }
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

  toggleZeroValueAssets: () => {
    set((state) => ({ showZeroValueAssets: !state.showZeroValueAssets }))
  },

  setChartType: (chartType: ChartType) => {
    set({ chartType })
  },
}))
