'use client'

import { useState, useEffect } from 'react'
import { getLenders } from '@/server/actions/lender/getLenders'

interface LenderWithEntity {
  id: string
  entity: {
    id: string
    legalName: string
    dba: string | null
  }
}

export function useLenders() {
  const [lenders, setLenders] = useState<LenderWithEntity[]>([])
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