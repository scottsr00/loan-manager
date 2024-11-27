'use client'

import { useEffect, useState } from 'react'
import { getSofrRate } from '@/app/actions/getSofrRate'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BaseRate {
  name: string
  value: number
  effectiveDate: string
}

export function SofrRateDisplay() {
  const [selectedRate, setSelectedRate] = useState<string>('SOFR')
  const [rates, setRates] = useState<Record<string, BaseRate>>({
    'SOFR': { name: 'SOFR', value: 0, effectiveDate: '' },
    'LIBOR': { name: 'LIBOR', value: 5.25, effectiveDate: new Date().toISOString() }, // Example fixed rate
    'Prime': { name: 'Prime', value: 8.50, effectiveDate: new Date().toISOString() }  // Example fixed rate
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRates() {
      try {
        const sofrData = await getSofrRate()
        setRates(prev => ({
          ...prev,
          'SOFR': {
            name: 'SOFR',
            value: sofrData.rate,
            effectiveDate: sofrData.effectiveDate
          }
        }))
      } catch (error) {
        console.error('Error fetching SOFR rate:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRates()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <span className="text-sm text-muted-foreground">Loading rates...</span>
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
              {Object.values(rates).map((rate) => (
                <SelectItem key={rate.name} value={rate.name}>
                  <div className="flex items-center justify-between w-full">
                    <span>{rate.name}</span>
                    <span className="font-mono">{rate.value.toFixed(2)}%</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            as of {formatDate(rates[selectedRate].effectiveDate)}
          </span>
        </div>
      )}
    </div>
  )
} 