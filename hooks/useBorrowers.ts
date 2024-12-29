'use client'

import { useState, useEffect, useCallback } from 'react'
import { getBorrowers } from '@/server/actions/borrower/getBorrowers'
import { createBorrower } from '@/server/actions/borrower/createBorrower'
import type { Borrower, CreateBorrowerInput } from '@/types/borrower'
import { withErrorHandling } from '@/lib/error-handling'

export function useBorrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        setIsLoading(true)
        const data = await getBorrowers()
        setBorrowers(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch borrowers'))
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchBorrowers()
  }, [])

  const refresh = useCallback(() => {
    setIsLoading(true)
    getBorrowers()
      .then(data => setBorrowers(data))
      .catch(err => setError(err instanceof Error ? err : new Error('Failed to fetch borrowers')))
      .finally(() => setIsLoading(false))
  }, [])

  const create = useCallback(async (data: CreateBorrowerInput) => {
    await withErrorHandling(
      'create borrower',
      async () => {
        await createBorrower(data)
        await refresh()
      }
    )
  }, [refresh])

  return {
    borrowers,
    isLoading,
    error,
    refresh,
    create
  }
} 