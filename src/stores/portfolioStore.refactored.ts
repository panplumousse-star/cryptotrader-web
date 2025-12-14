import { create } from 'zustand'
import type { Asset } from '@/lib/api/portfolio'

/**
 * Portfolio UI State Store
 *
 * This store ONLY manages UI-specific state like filters, sorting, and view preferences.
 * API data fetching is handled by React Query hooks in @/lib/api/portfolio
 *
 * Separation of concerns:
 * - React Query: Server state (API data, caching, refetching)
 * - Zustand: Client state (UI preferences, filters, selections)
 */
interface PortfolioUIState {
  // View preferences
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void

  // Filters
  searchQuery: string
  setSearchQuery: (query: string) => void

  hideSmallBalances: boolean
  setHideSmallBalances: (hide: boolean) => void

  minBalanceThreshold: number
  setMinBalanceThreshold: (threshold: number) => void

  // Sorting
  sortBy: 'value' | 'pnl' | 'pnlPercent' | 'symbol' | 'allocation'
  setSortBy: (field: 'value' | 'pnl' | 'pnlPercent' | 'symbol' | 'allocation') => void

  sortOrder: 'asc' | 'desc'
  setSortOrder: (order: 'asc' | 'desc') => void

  toggleSortOrder: () => void

  // Selection (for bulk actions)
  selectedAssets: string[]
  toggleAssetSelection: (symbol: string) => void
  clearSelection: () => void
  selectAll: (symbols: string[]) => void

  // Utility functions
  resetFilters: () => void
  getFilteredAssets: (assets: Asset[]) => Asset[]
  getSortedAssets: (assets: Asset[]) => Asset[]
}

export const usePortfolioUIStore = create<PortfolioUIState>((set, get) => ({
  // Initial state
  viewMode: 'list',
  searchQuery: '',
  hideSmallBalances: false,
  minBalanceThreshold: 1,
  sortBy: 'value',
  sortOrder: 'desc',
  selectedAssets: [],

  // View mode
  setViewMode: (mode) => set({ viewMode: mode }),

  // Filters
  setSearchQuery: (query) => set({ searchQuery: query }),
  setHideSmallBalances: (hide) => set({ hideSmallBalances: hide }),
  setMinBalanceThreshold: (threshold) => set({ minBalanceThreshold: threshold }),

  // Sorting
  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  toggleSortOrder: () => {
    set((state) => ({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' }))
  },

  // Selection
  toggleAssetSelection: (symbol) => {
    set((state) => ({
      selectedAssets: state.selectedAssets.includes(symbol)
        ? state.selectedAssets.filter((s) => s !== symbol)
        : [...state.selectedAssets, symbol],
    }))
  },
  clearSelection: () => set({ selectedAssets: [] }),
  selectAll: (symbols) => set({ selectedAssets: symbols }),

  // Utility functions
  resetFilters: () => {
    set({
      searchQuery: '',
      hideSmallBalances: false,
      minBalanceThreshold: 1,
      sortBy: 'value',
      sortOrder: 'desc',
    })
  },

  getFilteredAssets: (assets) => {
    const state = get()
    let filtered = [...assets]

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query)
      )
    }

    // Apply small balance filter
    if (state.hideSmallBalances) {
      filtered = filtered.filter((asset) => asset.value >= state.minBalanceThreshold)
    }

    return filtered
  },

  getSortedAssets: (assets) => {
    const state = get()
    const sorted = [...assets]

    sorted.sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (state.sortBy) {
        case 'symbol':
          aValue = a.symbol
          bValue = b.symbol
          break
        case 'value':
          aValue = a.value
          bValue = b.value
          break
        case 'pnl':
          aValue = a.pnl
          bValue = b.pnl
          break
        case 'pnlPercent':
          aValue = a.pnlPercent
          bValue = b.pnlPercent
          break
        case 'allocation':
          aValue = a.allocation
          bValue = b.allocation
          break
        default:
          return 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return state.sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return state.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return sorted
  },
}))
