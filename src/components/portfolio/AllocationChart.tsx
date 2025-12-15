'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import type { Asset } from '@/stores/portfolioStore'

interface AllocationChartProps {
  assets: Asset[]
  isLoading: boolean
}

interface ChartDataPoint {
  name: string
  symbol: string
  value: number
  allocation: number
  [key: string]: string | number
}

// Chart colors using CSS variables
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ChartDataPoint }>
}) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload

  return (
    <div className="bg-popover border-border rounded-lg border p-3 shadow-lg">
      <p className="text-foreground mb-1 text-sm font-medium">{data.name}</p>
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">
          Valeur:{' '}
          <span className="text-foreground font-medium">
            ${data.value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
        <p className="text-muted-foreground text-sm">
          Allocation:{' '}
          <span className="text-foreground font-medium">
            {data.allocation.toFixed(2)}%
          </span>
        </p>
      </div>
    </div>
  )
}

// Custom legend component
function CustomLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string; payload: ChartDataPoint }>
}) {
  if (!payload || !payload.length) {
    return null
  }

  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
      {payload.map((entry, index) => (
        <li key={`legend-${index}`} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground text-sm">
            {entry.payload.symbol}{' '}
            <span className="text-foreground font-medium">
              {entry.payload.allocation.toFixed(1)}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

// Loading skeleton
function ChartSkeleton() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Skeleton className="h-40 w-40 rounded-full" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

// Empty state
function ChartEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <p className="text-muted-foreground text-sm">
        Aucune donnee d&apos;allocation disponible
      </p>
    </div>
  )
}

export function AllocationChart({ assets, isLoading }: AllocationChartProps) {
  // Transform data for the chart
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!assets || assets.length === 0) {
      return []
    }

    return assets.map((asset) => ({
      name: asset.name,
      symbol: asset.symbol,
      value: asset.value,
      allocation: asset.allocation,
    }))
  }, [assets])

  // Loading state
  if (isLoading) {
    return <ChartSkeleton />
  }

  // Empty state
  if (chartData.length === 0) {
    return <ChartEmpty />
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              animationDuration={750}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="var(--background)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={<CustomLegend />}
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
