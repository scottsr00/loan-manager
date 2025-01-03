'use client'

import { useState, useEffect } from 'react'
import { getFacilityPositionHierarchy } from '@/server/actions/facility/getFacilityPositionHierarchy'
import type { FacilityPositionHierarchyView } from '@/server/types/facility-position'

export function usePositions() {
  const [positions, setPositions] = useState<FacilityPositionHierarchyView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPositions = async () => {
    try {
      setIsLoading(true)
      const data = await getFacilityPositionHierarchy()
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