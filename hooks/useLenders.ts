'use client'

import { useState, useEffect } from 'react'
import { getLenders } from '@/server/actions/lender/getLenders'

interface Lender {
  id: string
  legalName: string
}

export function useLenders() {
  const [lenders, setLenders] = useState<Lender[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchLenders() {
      try {
        setIsLoading(true)
        const data = await getLenders()
        setLenders(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch lenders'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchLenders()
  }, [])

  return {
    lenders,
    isLoading,
    error
  }
} 