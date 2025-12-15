import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type { PortfolioSummary } from '@/types/api'
import { AxiosError } from 'axios'

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

interface BackendPortfolioResponse {
  holdings: BackendHolding[]
  summary?: {
    total_value?: number
    total_pnl?: number
    total_pnl_percent?: number
    change_since_start?: number
    change_since_start_percent?: number
  }
}

// Frontend Asset type
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

// Portfolio query result
export interface PortfolioData {
  assets: Asset[]
  summary: PortfolioSummary
}

// Error response type
interface ApiErrorDetail {
  detail: string | Record<string, unknown>
}

// Query keys
export const portfolioKeys = {
  all: ['portfolio'] as const,
  detail: () => [...portfolioKeys.all, 'detail'] as const,
  summary: () => [...portfolioKeys.all, 'summary'] as const,
}

/**
 * Fetch portfolio data from API
 */
async function fetchPortfolio(): Promise<PortfolioData> {
  const response = await apiClient.get<BackendPortfolioResponse>('/portfolio')

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

  return {
    assets: mappedAssets,
    summary,
  }
}

/**
 * Hook to fetch portfolio data with React Query
 *
 * Features:
 * - Automatic caching (30s stale time)
 * - Auto-refetch every 60s
 * - Retry on failure (3 attempts)
 * - Proper error handling
 */
export function usePortfolioQuery() {
  return useQuery<PortfolioData, AxiosError<ApiErrorDetail>>({
    queryKey: portfolioKeys.detail(),
    queryFn: fetchPortfolio,
    staleTime: 30000, // Data is fresh for 30 seconds
    refetchInterval: 60000, // Auto-refetch every 60 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to manually refetch portfolio data
 */
export function useRefreshPortfolio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fetchPortfolio,
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(portfolioKeys.detail(), data)
    },
  })
}

/**
 * Hook to invalidate portfolio cache (force refetch)
 */
export function useInvalidatePortfolio() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: portfolioKeys.all })
  }
}
