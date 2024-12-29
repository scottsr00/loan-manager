'use client'

import { useState } from 'react'
import { useMarketRates } from '@/hooks/useMarketRates'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from 'lucide-react'

export function SofrRateDisplay() {
  const [selectedRate, setSelectedRate] = useState<string>('SOFR')
  const { rates, isLoading, isError } = useMarketRates()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isError) {
    return (
      <span className="text-sm text-destructive">
        Error loading rates. Please try again later.
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading rates...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Select
            value={selectedRate}
            onValueChange={setSelectedRate}
          >
            <SelectTrigger className="w-[180px] h-8 bg-primary-foreground text-primary">
              <SelectValue placeholder="Select base rate" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(rates).map(([key, rate]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center justify-between w-full">
                    <span>{rate.name}</span>
                    <span className="font-mono">{rate.value.toFixed(2)}%</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            as of {formatDate(rates[selectedRate as keyof typeof rates].effectiveDate)}
          </span>
        </div>
      )}
    </div>
  )
} 