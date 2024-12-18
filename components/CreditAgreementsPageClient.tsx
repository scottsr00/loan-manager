'use client'

import { ScrollText } from 'lucide-react'
import { NewCreditAgreementModal } from '@/components/NewCreditAgreementModal'
import { CreditAgreementList } from '@/components/CreditAgreementList'
import { useCreditAgreements } from '@/hooks/useCreditAgreements'

export function CreditAgreementsPageClient() {
  const { creditAgreements, isLoading, isError, mutate } = useCreditAgreements()

  const handleCreditAgreementCreated = () => {
    mutate()
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Error: Failed to load credit agreements</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading credit agreements...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Credit Agreements</h2>
          <p className="text-muted-foreground">
            Manage your credit agreements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <NewCreditAgreementModal onCreditAgreementCreated={handleCreditAgreementCreated} />
        </div>
      </div>

      {creditAgreements.length === 0 ? (
        <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <ScrollText className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No credit agreements</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven't created any credit agreements yet. Add one to get started.
            </p>
            <NewCreditAgreementModal onCreditAgreementCreated={handleCreditAgreementCreated} />
          </div>
        </div>
      ) : (
        <CreditAgreementList creditAgreements={creditAgreements} />
      )}
    </div>
  )
} 