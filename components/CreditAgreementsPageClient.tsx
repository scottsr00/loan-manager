'use client'

import { useState } from 'react'
import { ScrollText } from 'lucide-react'
import { NewCreditAgreementModal } from '@/components/NewCreditAgreementModal'
import { CreditAgreementList } from '@/components/CreditAgreementList'
import { getCreditAgreements } from '@/server/actions/loan/getCreditAgreements'
import { type CreditAgreementWithRelations } from '@/server/types/credit-agreement'

interface CreditAgreementsPageClientProps {
  initialCreditAgreements: CreditAgreementWithRelations[]
}

export function CreditAgreementsPageClient({ 
  initialCreditAgreements 
}: CreditAgreementsPageClientProps) {
  const [creditAgreements, setCreditAgreements] = useState<CreditAgreementWithRelations[]>(initialCreditAgreements)

  const handleUpdate = async () => {
    try {
      const updatedAgreements = await getCreditAgreements()
      setCreditAgreements(updatedAgreements as CreditAgreementWithRelations[])
    } catch (error) {
      console.error('Failed to update credit agreements:', error)
    }
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
          <NewCreditAgreementModal onCreditAgreementCreated={handleUpdate} />
        </div>
      </div>

      {creditAgreements.length === 0 ? (
        <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <ScrollText className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No credit agreements</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven&apos;t created any credit agreements yet. Add one to get started.
            </p>
            <NewCreditAgreementModal onCreditAgreementCreated={handleUpdate} />
          </div>
        </div>
      ) : (
        <CreditAgreementList 
          creditAgreements={creditAgreements} 
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
} 