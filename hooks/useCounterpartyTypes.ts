import useSWR from 'swr'
import { getCounterpartyTypes } from '@/server/actions/counterparty/getCounterpartyTypes'
import type { CounterpartyType } from '@prisma/client'

export function useCounterpartyTypes() {
  const { data, error, isLoading } = useSWR<CounterpartyType[]>(
    'counterpartyTypes',
    () => getCounterpartyTypes()
  )

  return {
    counterpartyTypes: data,
    isError: error,
    isLoading,
  }
} 