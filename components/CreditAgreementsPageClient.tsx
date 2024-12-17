'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollText } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { NewCreditAgreementModal } from '@/components/NewCreditAgreementModal'
import { CreditAgreementDetailsModal } from '@/components/CreditAgreementDetailsModal'
import { useCreditAgreements } from '@/hooks/useCreditAgreements'
import { CreditAgreement, Borrower, Lender, Facility } from '@prisma/client'

type CreditAgreementWithRelations = CreditAgreement & {
  borrower: Borrower;
  lender: Lender;
  facilities: Facility[];
}

export function CreditAgreementsPageClient() {
  const [selectedCreditAgreement, setSelectedCreditAgreement] = useState<CreditAgreementWithRelations | null>(null)
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
        <div className="grid gap-6">
          {creditAgreements.map((agreement) => (
            <div
              key={agreement.id}
              className="rounded-lg border bg-card p-4 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => setSelectedCreditAgreement(agreement)}
            >
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-semibold">{agreement.agreementName}</h3>
                    <Badge variant={agreement.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {agreement.status}
                    </Badge>
                  </div>
                  <Badge variant="outline">{agreement.agreementNumber}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Borrower</p>
                    <p className="text-sm text-muted-foreground">{agreement.borrower.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {agreement.borrower.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Status: {agreement.borrower.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lender</p>
                    <p className="text-sm text-muted-foreground">{agreement.lender.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {agreement.lender.type}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(agreement.amount)} {agreement.currency}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rate: {agreement.interestRate}%
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(agreement.startDate), 'PP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Maturity Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(agreement.maturityDate), 'PP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreditAgreementDetailsModal
        creditAgreement={selectedCreditAgreement}
        isOpen={!!selectedCreditAgreement}
        onClose={() => setSelectedCreditAgreement(null)}
      />
    </div>
  )
} 