'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, ChevronDown, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { TimeRange } from '@/stores/portfolioStore'

// Relative time range options (Grafana-style)
const RELATIVE_TIME_RANGES = [
  { label: '5 dernieres minutes', value: '5m' },
  { label: '15 dernieres minutes', value: '15m' },
  { label: '30 dernieres minutes', value: '30m' },
  { label: 'Derniere heure', value: '1h' },
  { label: '3 dernieres heures', value: '3h' },
  { label: '6 dernieres heures', value: '6h' },
  { label: '12 dernieres heures', value: '12h' },
  { label: '24 dernieres heures', value: '1D' },
  { label: '2 derniers jours', value: '2d' },
  { label: '7 derniers jours', value: '1W' },
  { label: '30 derniers jours', value: '1M' },
  { label: '3 derniers mois', value: '3M' },
  { label: '6 derniers mois', value: '6M' },
  { label: '1 an', value: '1Y' },
  { label: 'Tout', value: 'ALL' },
]

// Compact display format mapping for button trigger
const COMPACT_FORMAT_MAP: Record<string, string> = {
  '5m': '5m-now',
  '15m': '15m-now',
  '30m': '30m-now',
  '1h': '1h-now',
  '3h': '3h-now',
  '6h': '6h-now',
  '12h': '12h-now',
  '1D': '1D-now',
  '2d': '2d-now',
  '1W': '1W-now',
  '1M': '1M-now',
  '3M': '3M-now',
  '6M': '6M-now',
  '1Y': '1Y-now',
  'ALL': 'ALL',
}

interface TimeRangePickerProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  className?: string
}

export function TimeRangePicker({ value, onChange, className }: TimeRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [fromDate, setFromDate] = useState<Date | undefined>(value.from)
  const [toDate, setToDate] = useState<Date | undefined>(value.to)

  // Get display label for current selection
  const getDisplayLabel = (): string => {
    if (value.type === 'relative' && value.relativeValue) {
      return COMPACT_FORMAT_MAP[value.relativeValue] || value.relativeValue
    }
    if (value.type === 'absolute' && value.from && value.to) {
      return `${format(value.from, 'd MMM', { locale: fr })} - ${format(value.to, 'd MMM', { locale: fr })}`
    }
    return '1M-now'
  }

  // Handle relative time selection
  const handleRelativeSelect = (relativeValue: string) => {
    onChange({
      type: 'relative',
      relativeValue,
      from: undefined,
      to: undefined,
    })
    setOpen(false)
  }

  // Handle absolute date range apply
  const handleApplyAbsolute = () => {
    if (fromDate && toDate) {
      onChange({
        type: 'absolute',
        relativeValue: undefined,
        from: fromDate,
        to: toDate,
      })
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-between gap-2 min-w-[140px] font-normal',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{getDisplayLabel()}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        sideOffset={8}
      >
        <div className="flex">
          {/* Left panel: Relative time ranges */}
          <div className="border-r w-[120px] max-h-[400px] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-popover p-3 border-b">
              <h4 className="text-sm font-medium text-muted-foreground">
                Plage relative
              </h4>
            </div>
            <div className="p-1">
              {RELATIVE_TIME_RANGES.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRelativeSelect(option.value)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    value.type === 'relative' && value.relativeValue === option.value
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-foreground'
                  )}
                >
                  {COMPACT_FORMAT_MAP[option.value] || option.value}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel: Absolute date range */}
          <div className="w-[320px]">
            <div className="p-3 border-b">
              <h4 className="text-sm font-medium text-muted-foreground">
                Plage absolue
              </h4>
            </div>
            <div className="p-3 space-y-4">
              {/* From date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  De
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !fromDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? (
                        format(fromDate, 'd MMMM yyyy', { locale: fr })
                      ) : (
                        <span>Choisir une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      disabled={(date) =>
                        date > new Date() || (toDate ? date > toDate : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  A
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !toDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? (
                        format(toDate, 'd MMMM yyyy', { locale: fr })
                      ) : (
                        <span>Choisir une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      disabled={(date) =>
                        date > new Date() || (fromDate ? date < fromDate : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Apply button */}
              <Button
                onClick={handleApplyAbsolute}
                disabled={!fromDate || !toDate}
                className="w-full"
              >
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
