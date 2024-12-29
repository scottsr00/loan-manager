import useSWR from 'swr'
import { type CreditAgreementWithRelations } from '@/server/types/credit-agreement'
import { getCreditAgreements, getCreditAgreement } from '@/server/actions/loan/getCreditAgreements'

export function useCreditAgreements() {
  const { data, error, isLoading, mutate } = useSWR<CreditAgreementWithRelations[]>(
    'credit-agreements',
    getCreditAgreements
  )

  return {
    creditAgreements: data || [],
    isLoading,
    isError: error,
    mutate
  }
}

export function useCreditAgreement(id: string) {
  const { data, error, isLoading, mutate } = useSWR<CreditAgreementWithRelations | null>(
    ['credit-agreement', id],
    () => getCreditAgreement(id)
  )

  return {
    creditAgreement: data,
    isLoading,
    isError: error,
    mutate
  }
} 