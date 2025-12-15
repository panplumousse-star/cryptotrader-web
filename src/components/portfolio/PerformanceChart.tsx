'use client'

import { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Customized,
} from 'recharts'
import { format, differenceInHours } from 'date-fns'
import { fr } from 'date-fns/locale'
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, Database, BarChart3, LineChart as LineChartIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AssetSelector, ASSET_COLOR } from '@/components/portfolio/AssetSelector'
import { cn } from '@/lib/utils'
import type { TimeRange, AssetPerformanceResponse, Asset } from '@/stores/portfolioStore'

// Map relative time values to hours for determining X-axis format
const TIME_RANGE_HOURS: Record<string, number> = {
  '5m': 0.083,
  '15m': 0.25,
  '30m': 0.5,
  '1h': 1,
  '3h': 3,
  '6h': 6,
  '12h': 12,
  '1D': 24,
  '2d': 48,
  '1W': 168,
  '1M': 720,
  '3M': 2160,
  '6M': 4320,
  '1Y': 8760,
  'ALL': 87600, // 10 years as fallback
}

export interface PerformanceDataPoint {
  timestamp: string
  value: number
  pnl: number
  pnl_percent: number
}

export type DataSource = 'historical' | 'no_data'

export type ChartType = 'area' | 'bar'

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

interface PerformanceChartProps {
  data: PerformanceData | null
  isLoading: boolean
  error: string | null
  onRetry?: () => void
  timeRange: TimeRange
  // Asset selection props (single-select: null = portfolio, string = specific asset)
  availableAssets: Asset[]
  selectedAsset: string | null
  onSelectedAssetChange: (asset: string | null) => void
  assetPerformanceData: AssetPerformanceResponse | null
  assetPerformanceLoading: boolean
  // Chart type props
  chartType: ChartType
  onChartTypeChange: (type: ChartType) => void
}

interface ChartDataPoint {
  date: string
  value: number
  pnl: number
  pnlPercent: number
  timestamp: string
  evolutionPercent: number // Point-to-point percentage change
}

// Helper function to determine bar/segment color based on evolution
function getEvolutionColor(evolutionPercent: number): string {
  if (evolutionPercent > 0) return 'var(--profit)'
  if (evolutionPercent < 0) return 'var(--loss)'
  return 'var(--muted-foreground)'
}

// Helper function to get gradient ID based on evolution
function getBarGradientId(evolutionPercent: number): string {
  if (evolutionPercent > 0) return 'url(#barGradientProfit)'
  if (evolutionPercent < 0) return 'url(#barGradientLoss)'
  return 'url(#barGradientNeutral)'
}

// Custom bar shape component with hover shadow effect
interface CustomBarShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  evolutionPercent: number
  isHovered?: boolean
}

function CustomBarShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  evolutionPercent,
  isHovered = false,
}: CustomBarShapeProps) {
  const gradientId = getBarGradientId(evolutionPercent)
  const shadowColor = evolutionPercent > 0
    ? 'rgba(34, 197, 94, 0.4)'
    : evolutionPercent < 0
      ? 'rgba(239, 68, 68, 0.4)'
      : 'rgba(156, 163, 175, 0.4)'

  return (
    <g>
      {/* Shadow on hover */}
      {isHovered && (
        <rect
          x={x - 2}
          y={y - 2}
          width={width + 4}
          height={height + 4}
          rx={6}
          ry={6}
          fill="none"
          stroke={shadowColor}
          strokeWidth={3}
          style={{
            filter: 'blur(4px)',
          }}
        />
      )}
      {/* Main bar with gradient */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        ry={4}
        fill={gradientId}
        style={{
          transition: 'all 0.2s ease-in-out',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          transformOrigin: `${x + width / 2}px ${y + height}px`,
        }}
      />
      {/* Subtle highlight overlay for 3D effect */}
      <rect
        x={x}
        y={y}
        width={width * 0.4}
        height={height}
        rx={4}
        ry={4}
        fill="url(#barHighlight)"
        style={{ pointerEvents: 'none' }}
      />
    </g>
  )
}

// Bar gradient definitions component
function BarGradientDefs() {
  return (
    <defs>
      {/* Profit bar gradient (green) */}
      <linearGradient id="barGradientProfit" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--profit)" stopOpacity={0.85} />
        <stop offset="50%" stopColor="var(--profit)" stopOpacity={1} />
        <stop offset="100%" stopColor="var(--profit)" stopOpacity={0.75} />
      </linearGradient>
      {/* Loss bar gradient (red) */}
      <linearGradient id="barGradientLoss" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--loss)" stopOpacity={0.85} />
        <stop offset="50%" stopColor="var(--loss)" stopOpacity={1} />
        <stop offset="100%" stopColor="var(--loss)" stopOpacity={0.75} />
      </linearGradient>
      {/* Neutral bar gradient (gray) */}
      <linearGradient id="barGradientNeutral" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.85} />
        <stop offset="50%" stopColor="var(--muted-foreground)" stopOpacity={1} />
        <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity={0.75} />
      </linearGradient>
      {/* Highlight overlay for 3D relief effect */}
      <linearGradient id="barHighlight" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="white" stopOpacity={0.15} />
        <stop offset="100%" stopColor="white" stopOpacity={0} />
      </linearGradient>
    </defs>
  )
}

// Area gradient definitions for profit/loss coloring in AreaChart
function AreaGradientDefs() {
  return (
    <defs>
      <linearGradient id="areaGradientProfit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="var(--profit)" stopOpacity={0.3} />
        <stop offset="95%" stopColor="var(--profit)" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="areaGradientLoss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="var(--loss)" stopOpacity={0.3} />
        <stop offset="95%" stopColor="var(--loss)" stopOpacity={0} />
      </linearGradient>
    </defs>
  )
}

// Helper type for chart points with position and payload
interface ChartPoint {
  x: number
  y: number
  payload: { evolutionPercent: number }
}

// Helper function to identify consecutive phases (up/down segments)
interface Phase {
  startIndex: number
  endIndex: number
  isPositive: boolean
}

function identifyPhases(points: ChartPoint[]): Phase[] {
  if (!points || points.length < 2) return []

  const phases: Phase[] = []
  let currentPhaseStart = 0
  let currentIsPositive = points[1]?.payload?.evolutionPercent >= 0

  for (let i = 2; i < points.length; i++) {
    const pointIsPositive = points[i]?.payload?.evolutionPercent >= 0

    if (pointIsPositive !== currentIsPositive) {
      // Phase change detected, save current phase
      phases.push({
        startIndex: currentPhaseStart,
        endIndex: i - 1,
        isPositive: currentIsPositive,
      })
      currentPhaseStart = i - 1 // Overlap by 1 point for continuity
      currentIsPositive = pointIsPositive
    }
  }

  // Add final phase
  phases.push({
    startIndex: currentPhaseStart,
    endIndex: points.length - 1,
    isPositive: currentIsPositive,
  })

  return phases
}

// Custom area path component for per-segment coloring with area fill
interface CustomizedAreaPathProps {
  points?: ChartPoint[]
  baseLine?: number // Y coordinate of the baseline (bottom of chart)
}

function CustomizedAreaPath({ points, baseLine }: CustomizedAreaPathProps) {
  if (!points || points.length < 2) return null

  const phases = identifyPhases(points)
  const baseY = baseLine ?? Math.max(...points.map(p => p.y)) // Use bottom if baseLine not provided

  return (
    <g>
      {/* Render area fills for each phase */}
      {phases.map((phase, phaseIndex) => {
        const phasePoints = points.slice(phase.startIndex, phase.endIndex + 1)
        if (phasePoints.length < 2) return null

        const gradientId = phase.isPositive ? 'url(#areaGradientProfit)' : 'url(#areaGradientLoss)'

        // Build area path: line from left to right, then down to baseline, then back
        let areaPath = `M ${phasePoints[0].x} ${phasePoints[0].y}`
        for (let i = 1; i < phasePoints.length; i++) {
          areaPath += ` L ${phasePoints[i].x} ${phasePoints[i].y}`
        }
        // Close the area by going to baseline and back
        areaPath += ` L ${phasePoints[phasePoints.length - 1].x} ${baseY}`
        areaPath += ` L ${phasePoints[0].x} ${baseY}`
        areaPath += ' Z'

        return (
          <path
            key={`area-phase-${phaseIndex}`}
            d={areaPath}
            fill={gradientId}
          />
        )
      })}

      {/* Render stroke lines for each segment (on top of areas) */}
      {points.slice(1).map((point, index) => {
        const prevPoint = points[index]
        const color = getEvolutionColor(point.payload.evolutionPercent)
        return (
          <path
            key={`stroke-segment-${index}`}
            d={`M ${prevPoint.x} ${prevPoint.y} L ${point.x} ${point.y}`}
            stroke={color}
            strokeWidth={2}
            fill="none"
          />
        )
      })}
    </g>
  )
}

// Phase separators component - renders vertical dotted lines at trend change points
interface PhaseSeparatorsProps {
  points?: ChartPoint[]
  topY?: number
  bottomY?: number
}

function PhaseSeparators({ points, topY, bottomY }: PhaseSeparatorsProps) {
  if (!points || points.length < 3) return null

  const transitions: number[] = []

  for (let i = 2; i < points.length; i++) {
    const prevIsPositive = points[i - 1]?.payload?.evolutionPercent >= 0
    const currentIsPositive = points[i]?.payload?.evolutionPercent >= 0

    if (prevIsPositive !== currentIsPositive) {
      transitions.push(points[i - 1].x)
    }
  }

  const minY = topY ?? Math.min(...points.map(p => p.y))
  const maxY = bottomY ?? Math.max(...points.map(p => p.y))

  return (
    <g>
      {transitions.map((x, index) => (
        <line
          key={`separator-${index}`}
          x1={x}
          y1={minY}
          x2={x}
          y2={maxY}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />
      ))}
    </g>
  )
}

// Custom line component for per-segment coloring
interface CustomizedLineProps {
  points?: Array<{ x: number; y: number; payload: { evolutionPercent: number } }>
}

function CustomizedLine({ points }: CustomizedLineProps) {
  if (!points || points.length < 2) return null

  return (
    <g>
      {points.slice(1).map((point, index) => {
        const prevPoint = points[index]
        const color = getEvolutionColor(point.payload.evolutionPercent)
        return (
          <path
            key={`segment-${index}`}
            d={`M ${prevPoint.x} ${prevPoint.y} L ${point.x} ${point.y}`}
            stroke={color}
            strokeWidth={2}
            fill="none"
          />
        )
      })}
    </g>
  )
}

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: ChartDataPoint }>
  label?: string
}) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const isPositive = data.pnl >= 0

  return (
    <div className="bg-popover border-border rounded-lg border p-3 shadow-lg">
      <p className="text-muted-foreground mb-2 text-sm">{label}</p>
      <div className="space-y-1">
        <p className="text-foreground text-sm font-medium">
          Valeur:{' '}
          <span className="font-bold">
            ${data.value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
        <p className={cn('text-sm', isPositive ? 'text-profit' : 'text-loss')}>
          P&L: {isPositive ? '+' : ''}
          ${Math.abs(data.pnl).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          ({isPositive ? '+' : ''}
          {data.pnlPercent.toFixed(2)}%)
        </p>
      </div>
    </div>
  )
}

// Single asset tooltip component for LineChart
interface SingleAssetTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    color: string
    payload: { date: string; timestamp: string; value: number; evolutionPercent: number }
  }>
  label?: string
  assetSymbol: string
}

function SingleAssetTooltip({ active, payload, label, assetSymbol }: SingleAssetTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const value = typeof data.value === 'number' ? data.value : 0
  const evolutionPercent = typeof data.evolutionPercent === 'number' ? data.evolutionPercent : 0
  const isPositive = evolutionPercent >= 0

  return (
    <div className="bg-popover border-border rounded-lg border p-3 shadow-lg">
      <p className="text-muted-foreground mb-2 text-sm">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: ASSET_COLOR }}
          />
          <span className="text-sm font-medium">{assetSymbol}:</span>
          <span className="text-sm font-bold">
            ${value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <p className={cn('text-sm', isPositive ? 'text-profit' : 'text-loss')}>
          Evolution: {isPositive ? '+' : ''}{evolutionPercent.toFixed(2)}%
        </p>
      </div>
    </div>
  )
}

// Loading skeleton
function ChartSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-[100px]" />
        <Skeleton className="h-5 w-[80px] rounded-full" />
      </div>
      <div className="flex-1">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  )
}

// Error state
function ChartError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <AlertCircle className="text-destructive h-10 w-10" />
      <p className="text-muted-foreground text-center text-sm">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reessayer
        </Button>
      )}
    </div>
  )
}

// Empty state
function ChartEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <p className="text-muted-foreground text-sm">
        Aucune donnee de performance disponible
      </p>
    </div>
  )
}

// Data source indicator
function DataSourceIndicator({
  dataSource,
  snapshotCount
}: {
  dataSource: DataSource
  snapshotCount: number
}) {
  if (dataSource === 'no_data') {
    return (
      <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <span className="text-sm text-amber-600 dark:text-amber-400">
          Aucune donnee historique disponible. Les snapshots se creent automatiquement toutes les 5 minutes.
        </span>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <UITooltip>
        <TooltipTrigger asChild>
          <div className="mb-3 flex items-center gap-1.5 cursor-help">
            <Badge
              variant="outline"
              className="gap-1 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
            >
              <Database className="h-3 w-3" />
              Donnees historiques
            </Badge>
            {snapshotCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({snapshotCount} snapshot{snapshotCount > 1 ? 's' : ''})
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Base sur {snapshotCount} snapshot{snapshotCount > 1 ? 's' : ''} de votre portfolio</p>
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  )
}

// Chart type toggle component
interface ChartTypeToggleProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

function ChartTypeToggle({ value, onChange }: ChartTypeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border bg-muted p-1">
      <button
        onClick={() => onChange('area')}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
          value === 'area'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="Graphique en courbe"
      >
        <LineChartIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('bar')}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
          value === 'bar'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="Graphique en barres"
      >
        <BarChart3 className="h-4 w-4" />
      </button>
    </div>
  )
}

// Helper to determine if we should show hours or days on X-axis
function shouldShowHours(timeRange: TimeRange, dataPoints: PerformanceDataPoint[]): boolean {
  if (timeRange.type === 'relative' && timeRange.relativeValue) {
    const hours = TIME_RANGE_HOURS[timeRange.relativeValue] || 720 // Default to 1M
    return hours <= 48
  }

  if (timeRange.type === 'absolute' && timeRange.from && timeRange.to) {
    const hours = differenceInHours(timeRange.to, timeRange.from)
    return hours <= 48
  }

  // Fallback: check data points span
  if (dataPoints.length >= 2) {
    const firstDate = new Date(dataPoints[0].timestamp)
    const lastDate = new Date(dataPoints[dataPoints.length - 1].timestamp)
    const hours = differenceInHours(lastDate, firstDate)
    return hours <= 48
  }

  return false
}

/**
 * Calculate dynamic Y-axis domain and tick formatting based on data range.
 */
interface YAxisConfig {
  domain: [number, number]
  tickFormatter: (value: number) => string
  tickCount?: number
}

function calculateYAxisConfig(dataPoints: { value: number }[]): YAxisConfig {
  if (!dataPoints || dataPoints.length === 0) {
    return {
      domain: [0, 100],
      tickFormatter: (value: number) => `$${value.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })}`,
    }
  }

  const values = dataPoints.map(p => p.value).filter(v => typeof v === 'number' && !isNaN(v))

  if (values.length === 0) {
    return {
      domain: [0, 100],
      tickFormatter: (value: number) => `$${value.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })}`,
    }
  }

  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue

  // Add padding (10% of range, minimum 0.01)
  const padding = Math.max(range * 0.1, 0.01)

  // Calculate domain with padding, but don't go below 0 if all values are positive
  const domainMin = minValue >= 0 ? Math.max(0, minValue - padding) : minValue - padding
  const domainMax = maxValue + padding

  // Determine tick formatter based on range
  let tickFormatter: (value: number) => string

  if (range < 1) {
    // Very small variations: show 2 decimal places (centimes)
    tickFormatter = (value: number) => `$${value.toFixed(2)}`
  } else if (range < 10) {
    // Small variations: show 1 decimal place
    tickFormatter = (value: number) => `$${value.toFixed(1)}`
  } else if (range < 100) {
    // Medium variations: no decimals
    tickFormatter = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`
  } else {
    // Large variations: compact notation
    tickFormatter = (value: number) => `$${value.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })}`
  }

  return {
    domain: [domainMin, domainMax],
    tickFormatter,
    tickCount: 5,
  }
}

export function PerformanceChart({
  data,
  isLoading,
  error,
  onRetry,
  timeRange,
  availableAssets,
  selectedAsset,
  onSelectedAssetChange,
  assetPerformanceData,
  assetPerformanceLoading,
  chartType,
  onChartTypeChange,
}: PerformanceChartProps) {
  // Determine if we're in asset mode (single asset selected)
  const isAssetMode = selectedAsset !== null

  // Track hovered bar index for shadow effect
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)

  // Determine X-axis format
  const showHoursOnXAxis = useMemo(() => {
    return shouldShowHours(timeRange, data?.data_points || [])
  }, [timeRange, data?.data_points])

  // Transform data for the standard area chart (total portfolio)
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data?.data_points || data.data_points.length === 0) {
      return []
    }

    return data.data_points.map((point, index, arr) => {
      // Calculate point-to-point evolution percentage
      let evolutionPercent = 0
      if (index > 0) {
        const prevPoint = arr[index - 1]
        const prevValue = prevPoint && typeof prevPoint.value === 'number' ? prevPoint.value : 0
        if (prevValue !== 0) {
          evolutionPercent = ((point.value - prevValue) / prevValue) * 100
        }
      }
      return {
        date: format(
          new Date(point.timestamp),
          showHoursOnXAxis ? 'HH:mm' : 'd MMM',
          { locale: fr }
        ),
        value: point.value,
        pnl: point.pnl,
        pnlPercent: point.pnl_percent,
        timestamp: point.timestamp,
        evolutionPercent,
      }
    })
  }, [data, showHoursOnXAxis])

  // Transform data for single asset line chart
  // CRITICAL: The data must have { date, value } structure where 'value' is the dataKey for the Line
  const singleAssetChartData = useMemo(() => {
    if (!assetPerformanceData?.data_points || assetPerformanceData.data_points.length === 0) {
      return []
    }

    return assetPerformanceData.data_points.map((point, index, arr) => {
      const value = typeof point.value === 'number' ? point.value : 0
      // Calculate evolution % from previous point
      let evolutionPercent = 0
      if (index > 0) {
        const prevPoint = arr[index - 1]
        const prevValue = prevPoint && typeof prevPoint.value === 'number' ? prevPoint.value : 0
        if (prevValue !== 0) {
          evolutionPercent = ((value - prevValue) / prevValue) * 100
        }
      }
      return {
        date: format(
          new Date(point.timestamp),
          showHoursOnXAxis ? 'HH:mm' : 'd MMM',
          { locale: fr }
        ),
        timestamp: point.timestamp,
        value,
        evolutionPercent,
      }
    })
  }, [assetPerformanceData, showHoursOnXAxis])

  // Determine if performance is positive
  const isPositive = data ? data.total_pnl >= 0 : true

  // Get chart colors based on performance
  const chartColor = isPositive
    ? 'var(--profit)'
    : 'var(--loss)'

  const gradientId = 'performanceGradient'

  // Asset list for selector
  const assetList = useMemo(() => {
    return availableAssets.map((a) => ({
      symbol: a.symbol,
      name: a.name,
    }))
  }, [availableAssets])

  // Calculate dynamic Y-axis config for portfolio chart
  const portfolioYAxisConfig = useMemo(() => {
    return calculateYAxisConfig(chartData)
  }, [chartData])

  // Calculate dynamic Y-axis config for single asset chart
  const assetYAxisConfig = useMemo(() => {
    return calculateYAxisConfig(singleAssetChartData)
  }, [singleAssetChartData])

  // Loading state
  const showLoading = isLoading || (isAssetMode && assetPerformanceLoading)
  if (showLoading) {
    return <ChartSkeleton />
  }

  // Error state
  if (error) {
    return <ChartError error={error} onRetry={onRetry} />
  }

  // Empty state for total portfolio mode
  if (!isAssetMode && (!data || chartData.length === 0)) {
    return <ChartEmpty />
  }

  // Empty state for single asset mode
  if (isAssetMode && singleAssetChartData.length === 0) {
    return <ChartEmpty />
  }

  return (
    <div className="flex h-full flex-col">
      {/* Controls row: Asset selector + Chart type toggle */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <AssetSelector
          assets={assetList}
          selectedAsset={selectedAsset}
          onChange={onSelectedAssetChange}
        />
        <div className="ml-auto">
          <ChartTypeToggle value={chartType} onChange={onChartTypeChange} />
        </div>
      </div>

      {/* Data source indicator - show for both portfolio and asset modes */}
      {((!isAssetMode && data?.data_source) || (isAssetMode && assetPerformanceData?.data_source)) && (
        <DataSourceIndicator
          dataSource={isAssetMode ? assetPerformanceData!.data_source! : data!.data_source}
          snapshotCount={isAssetMode ? (assetPerformanceData?.snapshot_count || 0) : (data?.snapshot_count || 0)}
        />
      )}

      {/* Header with trend badge (only for total portfolio mode) */}
      {!isAssetMode && data && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('text-lg font-bold', isPositive ? 'text-profit' : 'text-loss')}>
              {isPositive ? '+' : ''}
              {data.total_pnl_percent.toFixed(2)}%
            </span>
            <span className="text-muted-foreground text-sm">
              ({isPositive ? '+' : ''}$
              {Math.abs(data.total_pnl).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              )
            </span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'gap-1',
              isPositive
                ? 'border-profit/30 bg-profit/10 text-profit'
                : 'border-loss/30 bg-loss/10 text-loss'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {isPositive ? 'Hausse' : 'Baisse'}
          </Badge>
        </div>
      )}

      {/* Single asset header with performance info */}
      {isAssetMode && assetPerformanceData && assetPerformanceData.assets.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: ASSET_COLOR }}
            />
            <span className="text-lg font-bold">{selectedAsset}</span>
            {(() => {
              const assetInfo = assetPerformanceData.assets[0]
              const pnlPercent = assetInfo?.pnl_percent ?? 0
              const isAssetPositive = pnlPercent >= 0
              return (
                <span
                  className={cn(
                    'text-lg font-bold',
                    isAssetPositive ? 'text-profit' : 'text-loss'
                  )}
                >
                  {isAssetPositive ? '+' : ''}
                  {pnlPercent.toFixed(2)}%
                </span>
              )
            })()}
          </div>
          {(() => {
            const assetInfo = assetPerformanceData.assets[0]
            const pnlPercent = assetInfo?.pnl_percent ?? 0
            const isAssetPositive = pnlPercent >= 0
            return (
              <Badge
                variant="outline"
                className={cn(
                  'gap-1',
                  isAssetPositive
                    ? 'border-profit/30 bg-profit/10 text-profit'
                    : 'border-loss/30 bg-loss/10 text-loss'
                )}
              >
                {isAssetPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isAssetPositive ? 'Hausse' : 'Baisse'}
              </Badge>
            )
          })()}
        </div>
      )}

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {isAssetMode ? (
            // Single asset mode: LineChart or BarChart
            chartType === 'bar' ? (
              <BarChart
                data={singleAssetChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                onMouseMove={(state) => {
                  if (state?.activeTooltipIndex !== undefined && typeof state.activeTooltipIndex === 'number') {
                    setHoveredBarIndex(state.activeTooltipIndex)
                  }
                }}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                <BarGradientDefs />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={assetYAxisConfig.tickFormatter}
                  domain={assetYAxisConfig.domain}
                  tickCount={assetYAxisConfig.tickCount}
                  dx={-10}
                  width={70}
                />
                <Tooltip
                  content={
                    <SingleAssetTooltip assetSymbol={selectedAsset || ''} />
                  }
                  cursor={false}
                />
                <Bar
                  dataKey="value"
                  animationDuration={750}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={(props: any) => (
                    <CustomBarShape
                      x={props.x}
                      y={props.y}
                      width={props.width}
                      height={props.height}
                      evolutionPercent={props.payload?.evolutionPercent ?? 0}
                      isHovered={hoveredBarIndex === props.index}
                    />
                  )}
                />
              </BarChart>
            ) : (
              <LineChart
                data={singleAssetChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={assetYAxisConfig.tickFormatter}
                  domain={assetYAxisConfig.domain}
                  tickCount={assetYAxisConfig.tickCount}
                  dx={-10}
                  width={70}
                />
                <Tooltip
                  content={
                    <SingleAssetTooltip assetSymbol={selectedAsset || ''} />
                  }
                />
                {/* Line with colored dots based on evolution */}
                <Line
                  type="linear"
                  dataKey="value"
                  stroke="transparent"
                  strokeWidth={0}
                  dot={({ cx, cy, payload }) => {
                    const color = getEvolutionColor(payload.evolutionPercent)
                    return (
                      <circle
                        key={`dot-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={color}
                        stroke={color}
                        strokeWidth={1}
                      />
                    )
                  }}
                  activeDot={{ r: 6 }}
                  animationDuration={750}
                />
                {/* Customized line segments with per-segment coloring */}
                <Line
                  type="linear"
                  dataKey="value"
                  stroke="transparent"
                  dot={false}
                  activeDot={false}
                  legendType="none"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={(props: any) => <CustomizedLine points={props.points} />}
                />
              </LineChart>
            )
          ) : (
            // Total portfolio mode: AreaChart or BarChart
            chartType === 'bar' ? (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                onMouseMove={(state) => {
                  if (state?.activeTooltipIndex !== undefined && typeof state.activeTooltipIndex === 'number') {
                    setHoveredBarIndex(state.activeTooltipIndex)
                  }
                }}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                <BarGradientDefs />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={portfolioYAxisConfig.tickFormatter}
                  domain={portfolioYAxisConfig.domain}
                  tickCount={portfolioYAxisConfig.tickCount}
                  dx={-10}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar
                  dataKey="value"
                  animationDuration={750}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={(props: any) => (
                    <CustomBarShape
                      x={props.x}
                      y={props.y}
                      width={props.width}
                      height={props.height}
                      evolutionPercent={props.payload?.pnlPercent ?? 0}
                      isHovered={hoveredBarIndex === props.index}
                    />
                  )}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={portfolioYAxisConfig.tickFormatter}
                  domain={portfolioYAxisConfig.domain}
                  tickCount={portfolioYAxisConfig.tickCount}
                  dx={-10}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  animationDuration={750}
                />
              </AreaChart>
            )
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
