# Portfolio Store Migration Guide

## Overview

This guide explains the migration from the old Zustand-based portfolio store (with API calls) to the new React Query + Zustand architecture.

## Architecture Changes

### Before (Anti-pattern)
```typescript
// ❌ OLD: Zustand handling both API calls AND UI state
const { assets, fetchPortfolio, isLoading, error } = usePortfolioStore()

useEffect(() => {
  fetchPortfolio() // Manual API call in Zustand
}, [])
```

**Problems:**
- Mixed concerns (API + UI state)
- No automatic caching
- No background refetching
- Manual loading state management
- Duplicated error handling
- No optimistic updates support

### After (Best Practice)
```typescript
// ✅ NEW: React Query for server state + Zustand for UI state
import { usePortfolioQuery } from '@/lib/api/portfolio'
import { usePortfolioUIStore } from '@/stores/portfolioStore.refactored'

const { data, isLoading, error, refetch } = usePortfolioQuery()
const { sortBy, setSortBy, getFilteredAssets } = usePortfolioUIStore()
```

**Benefits:**
- Clear separation of concerns
- Automatic caching (30s stale time)
- Auto-refetch every 60 seconds
- Smart retry logic
- Optimistic updates support
- Better TypeScript inference

## Migration Steps

### 1. Replace Portfolio Page

**Old Code (`portfolio/page.tsx`):**
```typescript
'use client'

import { useEffect } from 'react'
import { usePortfolioStore } from '@/stores/portfolioStore'

export default function PortfolioPage() {
  const { assets, summary, fetchPortfolio, isLoading, error } = usePortfolioStore()

  useEffect(() => {
    fetchPortfolio()
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Total: ${summary?.totalValue}</h1>
      {assets.map(asset => (
        <div key={asset.id}>{asset.symbol}</div>
      ))}
    </div>
  )
}
```

**New Code:**
```typescript
'use client'

import { usePortfolioQuery } from '@/lib/api/portfolio'
import { usePortfolioUIStore } from '@/stores/portfolioStore.refactored'

export default function PortfolioPage() {
  // React Query handles server state
  const { data, isLoading, error, refetch } = usePortfolioQuery()

  // Zustand handles UI state
  const { sortBy, setSortBy, getFilteredAssets, getSortedAssets } = usePortfolioUIStore()

  // No useEffect needed - React Query handles everything!

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null

  // Apply filters and sorting (UI concerns)
  const filteredAssets = getFilteredAssets(data.assets)
  const sortedAssets = getSortedAssets(filteredAssets)

  return (
    <div>
      <h1>Total: ${data.summary.totalValue}</h1>
      <button onClick={() => refetch()}>Refresh</button>

      {sortedAssets.map(asset => (
        <div key={asset.id}>{asset.symbol}</div>
      ))}
    </div>
  )
}
```

### 2. WebSocket Price Updates

**Old Code:**
```typescript
const { updateAssetPrice } = usePortfolioStore()

// In WebSocket handler
wsRef.current.onmessage = (event) => {
  const message = JSON.parse(event.data)
  if (message.type === 'ticker') {
    updateAssetPrice(message.data.symbol, message.data.price)
  }
}
```

**New Code:**
```typescript
import { useQueryClient } from '@tanstack/react-query'
import { portfolioKeys } from '@/lib/api/portfolio'

const queryClient = useQueryClient()

// In WebSocket handler
wsRef.current.onmessage = (event) => {
  const message = JSON.parse(event.data)

  if (message.type === 'ticker') {
    // Optimistic update - instantly update cache
    queryClient.setQueryData(portfolioKeys.detail(), (old) => {
      if (!old) return old

      return {
        ...old,
        assets: old.assets.map(asset => {
          if (asset.symbol === message.data.symbol) {
            const newPrice = message.data.price
            const value = asset.amount * newPrice
            const pnl = value - (asset.amount * asset.averagePrice)
            const pnlPercent = (pnl / (asset.amount * asset.averagePrice)) * 100

            return {
              ...asset,
              currentPrice: newPrice,
              value,
              pnl,
              pnlPercent
            }
          }
          return asset
        })
      }
    })
  }
}
```

### 3. Manual Refresh

**Old Code:**
```typescript
const { fetchPortfolio } = usePortfolioStore()

<button onClick={() => fetchPortfolio()}>Refresh</button>
```

**New Code:**
```typescript
const { refetch } = usePortfolioQuery()
// OR use the mutation hook for more control
const refreshMutation = useRefreshPortfolio()

<button onClick={() => refetch()}>Refresh</button>
// OR
<button
  onClick={() => refreshMutation.mutate()}
  disabled={refreshMutation.isPending}
>
  {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
</button>
```

### 4. Error Handling

**Old Code:**
```typescript
const { error, errorCode } = usePortfolioStore()

if (errorCode === 424) {
  return <div>API keys not configured</div>
}
```

**New Code:**
```typescript
import { AxiosError } from 'axios'

const { error } = usePortfolioQuery()

if (error) {
  const axiosError = error as AxiosError

  if (axiosError.response?.status === 424) {
    return <div>API keys not configured</div>
  }

  return <div>Error: {axiosError.message}</div>
}
```

## File Structure

```
src/
├── lib/
│   └── api/
│       ├── portfolio.ts              # React Query hooks + API logic
│       └── PORTFOLIO_MIGRATION.md    # This file
├── stores/
│   ├── portfolioStore.ts             # OLD (deprecated)
│   └── portfolioStore.refactored.ts  # NEW (UI state only)
└── app/
    └── (dashboard)/
        └── portfolio/
            └── page.tsx              # Use new hooks here
```

## React Query Features

### Automatic Background Refetching
```typescript
// Data automatically refetches every 60 seconds
const { data } = usePortfolioQuery()
```

### Manual Invalidation
```typescript
import { useInvalidatePortfolio } from '@/lib/api/portfolio'

const invalidatePortfolio = useInvalidatePortfolio()

// After placing an order
await placeOrder(...)
invalidatePortfolio() // Force refetch
```

### Custom Stale Time
```typescript
// Override default stale time (30s)
const { data } = usePortfolioQuery({
  staleTime: 10000, // 10 seconds
})
```

## Testing

### Old Store (Hard to Test)
```typescript
// ❌ Mocking Zustand + API client = complex
jest.mock('@/stores/portfolioStore')
jest.mock('@/lib/api/client')
```

### New Approach (Easy to Test)
```typescript
// ✅ Just mock React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

render(
  <QueryClientProvider client={queryClient}>
    <PortfolioPage />
  </QueryClientProvider>
)
```

## Checklist

Before deploying:

- [ ] Update `portfolio/page.tsx` to use `usePortfolioQuery`
- [ ] Update WebSocket handler to use `queryClient.setQueryData`
- [ ] Replace `fetchPortfolio()` calls with `refetch()`
- [ ] Update error handling to use AxiosError
- [ ] Remove old `portfolioStore.ts` (or rename to `.old.ts`)
- [ ] Rename `portfolioStore.refactored.ts` to `portfolioUIStore.ts`
- [ ] Update all imports
- [ ] Test manually:
  - [ ] Initial load
  - [ ] Manual refresh
  - [ ] WebSocket updates
  - [ ] Error states (401, 424, etc.)
  - [ ] Filters and sorting
- [ ] Run TypeScript checks: `npm run type-check`
- [ ] Run build: `npm run build`

## Questions?

See:
- [React Query docs](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand best practices](https://github.com/pmndrs/zustand#best-practices)
