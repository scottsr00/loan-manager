'use client'

import { useState, useEffect, useCallback } from 'react'
import { getBorrowers } from '@/server/actions/borrower/getBorrowers'
import type { BorrowerWithEntity } from '@/server/actions/borrower/getBorrowers'

export function useBorrowers() {
  const [borrowers, setBorrowers] = useState<BorrowerWithEntity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBorrowers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getBorrowers()
      setBorrowers(data)
    } catch (err) {
      console.error('Error fetching borrowers:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch borrowers'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBorrowers()
  }, [fetchBorrowers])

  return {
    borrowers,
    isLoading,
    error,
    refresh: fetchBorrowers
  }
} 