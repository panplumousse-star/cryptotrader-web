import { create } from 'zustand'

export type StrategyStatus = 'running' | 'paused' | 'stopped' | 'error'

export interface Strategy {
  id: string
  name: string
  description: string
  pair: string
  status: StrategyStatus
  config: Record<string, unknown>
  performance: StrategyPerformance
  createdAt: string
  updatedAt: string
}

export interface StrategyPerformance {
  totalTrades: number
  winRate: number
  totalPnl: number
  totalPnlPercent: number
  maxDrawdown: number
  sharpeRatio: number
}

export interface BotStatus {
  isRunning: boolean
  activeStrategies: number
  lastHeartbeat: string
  uptime: number
}

interface BotState {
  strategies: Strategy[]
  botStatus: BotStatus | null
  selectedStrategy: Strategy | null
  isLoading: boolean
  error: string | null
  setStrategies: (strategies: Strategy[]) => void
  setBotStatus: (status: BotStatus) => void
  setSelectedStrategy: (strategy: Strategy | null) => void
  addStrategy: (strategy: Strategy) => void
  updateStrategy: (strategyId: string, updates: Partial<Strategy>) => void
  removeStrategy: (strategyId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useBotStore = create<BotState>((set, get) => ({
  strategies: [],
  botStatus: null,
  selectedStrategy: null,
  isLoading: false,
  error: null,

  setStrategies: (strategies) => set({ strategies }),

  setBotStatus: (botStatus) => set({ botStatus }),

  setSelectedStrategy: (selectedStrategy) => set({ selectedStrategy }),

  addStrategy: (strategy) => set({ strategies: [...get().strategies, strategy] }),

  updateStrategy: (strategyId, updates) =>
    set({
      strategies: get().strategies.map((strategy) =>
        strategy.id === strategyId ? { ...strategy, ...updates } : strategy
      ),
    }),

  removeStrategy: (strategyId) =>
    set({
      strategies: get().strategies.filter((strategy) => strategy.id !== strategyId),
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}))
