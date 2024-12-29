'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { Counterparty, CounterpartyWithRelations, CreateCounterpartyInput } from '@/types/counterparty'
import { getCounterparties } from '@/server/actions/counterparty/getCounterparties'
import { createCounterparty } from '@/server/actions/counterparty/createCounterparty'
import { deleteCounterparty } from '@/server/actions/counterparty/deleteCounterparty'
import { withErrorHandling } from '@/lib/error-handling'

export function useCounterparties() {
  const { data, error, isLoading, mutate } = useSWR<CounterpartyWithRelations[]>(
    'counterparties',
    () => withErrorHandling(
      'fetch counterparties',
      async () => await getCounterparties()
    ),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  )

  const create = useCallback(async (counterpartyData: CreateCounterpartyInput) => {
    await withErrorHandling(
      'create counterparty',
      async () => {
        await createCounterparty(counterpartyData)
        await mutate()
      }
    )
  }, [mutate])

  const update = useCallback(async (id: string, counterpartyData: Partial<CreateCounterpartyInput>) => {
    await withErrorHandling(
      'update counterparty',
      async () => {
        // TODO: Implement updateCounterparty server action
        await mutate()
      }
    )
  }, [mutate])

  const remove = useCallback(async (id: string) => {
    await withErrorHandling(
      'delete counterparty',
      async () => {
        await deleteCounterparty(id)
        await mutate()
      }
    )
  }, [mutate])

  return {
    counterparties: data,
    isLoading,
    isError: error,
    mutate,
    create,
    update,
    remove,
  }
} 