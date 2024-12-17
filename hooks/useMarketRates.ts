'use client'

import useSWR from 'swr'
import { getSofrRate } from '@/server/actions/loan'
import { withErrorHandling } from '@/lib/error-handling'

export interface BaseRate {
  name: string
  value: number
  effectiveDate: string
}

export interface MarketRates {
  SOFR: BaseRate
  LIBOR: BaseRate
  Prime: BaseRate
}

const FALLBACK_RATES: MarketRates = {
  SOFR: { name: 'SOFR', value: 5.33, effectiveDate: new Date().toISOString() },
  LIBOR: { name: 'LIBOR', value: 5.25, effectiveDate: new Date().toISOString() },
  Prime: { name: 'Prime', value: 8.50, effectiveDate: new Date().toISOString() }
}

export function useMarketRates() {
  const { data: rates, error, isLoading } = useSWR<MarketRates>(
    'market-rates',
    async () => {
      const sofrData = await withErrorHandling(
        'fetch SOFR rate',
        async () => await getSofrRate()
      )

      return {
        ...FALLBACK_RATES,
        SOFR: {
          name: 'SOFR',
          value: sofrData.rate,
          effectiveDate: sofrData.effectiveDate
        }
      }
    },
    {
      refreshInterval: 3600000, // Refresh every hour
      fallbackData: FALLBACK_RATES,
      revalidateOnFocus: false
    }
  )

  return {
    rates: rates || FALLBACK_RATES,
    isLoading,
    isError: error
  }
} 