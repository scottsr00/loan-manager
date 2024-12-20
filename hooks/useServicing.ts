'use client'

import { useCallback } from 'react'
import { processPaydown } from '@/server/actions/loan/processPaydown'
import type { PaydownInput, PaydownResult } from '@/server/types/servicing'
import { withErrorHandling } from '@/lib/error-handling'

export function useServicing() {
  const handlePaydown = useCallback(async (params: PaydownInput): Promise<PaydownResult> => {
    return await withErrorHandling(
      'process paydown',
      async () => {
        const result = await processPaydown(params)
        return result
      }
    )
  }, [])

  return {
    processPaydown: handlePaydown
  }
} 