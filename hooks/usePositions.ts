'use client'

import { useState, useEffect } from 'react'
import { getPositions } from '@/server/actions/loan/getPositions'

export function usePositions() {
  const [positions, setPositions] = useState<Awaited<ReturnType<typeof getPositions>>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPositions = async () => {
    try {
      setIsLoading(true)
      const data = await getPositions()
      setPositions(data)
      setError(null)
    } catch (err) {
      setError('Failed to load positions')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPositions()
  }, [])

  return {
    positions,
    isLoading,
    error,
    refresh: loadPositions
  }
} 