'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { Borrower } from '@/components/borrowers/columns'
import { getBorrowers, createBorrower, deleteBorrower } from '@/app/actions/borrowerActions'

export function useBorrowers() {
  const { data, error, isLoading, mutate } = useSWR<Borrower[]>(
    'borrowers',
    () => getBorrowers()
  )

  const create = useCallback(async (borrowerData: Partial<Borrower>) => {
    const result = await createBorrower(borrowerData)
    mutate()
    return result
  }, [mutate])

  const remove = useCallback(async (id: string) => {
    await deleteBorrower(id)
    mutate()
  }, [mutate])

  return {
    borrowers: data,
    isLoading,
    isError: error,
    mutate,
    create,
    remove,
  }
} 