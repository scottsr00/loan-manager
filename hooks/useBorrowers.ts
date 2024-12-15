'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { Borrower } from '@/types/borrower'
import { getBorrowers } from '@/app/actions/getBorrowers'
import { createBorrower, type CreateBorrowerInput } from '@/app/actions/createBorrower'
import { deleteBorrower } from '@/app/actions/deleteBorrower'
import { withErrorHandling } from '@/lib/error-handling'
import { toast } from 'sonner'

export function useBorrowers() {
  const { data, error, isLoading, mutate } = useSWR<Borrower[]>(
    'borrowers',
    () => withErrorHandling(
      'fetch borrowers',
      async () => await getBorrowers()
    ),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true
    }
  )

  const create = useCallback(async (borrowerData: CreateBorrowerInput) => {
    await withErrorHandling(
      'create borrower',
      async () => {
        await createBorrower(borrowerData)
        await mutate()
      }
    )
  }, [mutate])

  const remove = useCallback(async (id: string) => {
    try {
      await withErrorHandling(
        'delete borrower',
        async () => {
          await deleteBorrower(id)
          await mutate()
        }
      )
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('active credit agreements')) {
          toast.error('Cannot Delete Borrower', {
            description: 'Please remove all credit agreements before deleting this borrower.'
          })
        } else if (error.message.includes('existing relationships')) {
          toast.error('Cannot Delete Borrower', {
            description: 'This borrower has existing relationships that must be removed first.'
          })
        } else {
          toast.error('Error', {
            description: error.message
          })
        }
      }
      throw error
    }
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