'use client'

import { useState } from 'react'
import { CreditAgreementWithRelations } from '@/app/actions/getCreditAgreements'
import { CreditAgreementDetailsModal } from '@/components/CreditAgreementDetailsModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollText, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { NewCreditAgreementModal } from '@/components/NewCreditAgreementModal'

interface CreditAgreementsPageClientProps {
  creditAgreements: {
    creditAgreements: CreditAgreementWithRelations[]
    error?: string
  }
}

export function CreditAgreementsPageClient({
  creditAgreements: creditAgreementsData
}: CreditAgreementsPageClientProps) {
  const [selectedCreditAgreement, setSelectedCreditAgreement] = useState<CreditAgreementWithRelations | null>(null)
  const [creditAgreements, setCreditAgreements] = useState(creditAgreementsData.creditAgreements)

  const handleCreditAgreementCreated = (newCreditAgreement: CreditAgreementWithRelations) => {
    setCreditAgreements(prev => [newCreditAgreement, ...prev])
  }

  if (creditAgreementsData.error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Error: {creditAgreementsData.error}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Credit Agreements</h2>
          <p className="text-muted-foreground">
            Manage your credit agreements and facilities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <NewCreditAgreementModal onCreditAgreementCreated={handleCreditAgreementCreated} />
        </div>
      </div>

      {creditAgreementsData.creditAgreements.length === 0 ? (
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
          {creditAgreementsData.creditAgreements.map((agreement) => (
            <div
              key={agreement.id}
              className="rounded-lg border bg-card p-4 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => setSelectedCreditAgreement(agreement)}
            >
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-semibold">{agreement.agent.legalName}</h3>
                    <Badge variant={agreement.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {agreement.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ID: {agreement.id}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Borrower</p>
                    <p className="text-sm text-muted-foreground">{agreement.borrower.entity.legalName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {agreement.borrower.creditRating || 'No Rating'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        KYC: {agreement.borrower.kycStatus}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(agreement.effectiveDate), 'PP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Maturity Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(agreement.maturityDate), 'PP')}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Facilities ({agreement.facilities.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {agreement.facilities.map((facility) => (
                      <Badge key={facility.id} variant="outline">
                        {facility.facilityType} - {formatCurrency(facility.commitmentAmount)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Covenants ({agreement.borrower.covenants.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {agreement.borrower.covenants.map((covenant) => (
                      <Badge 
                        key={covenant.id} 
                        variant={covenant.status === 'COMPLIANT' ? 'success' : 'destructive'}
                        className="text-xs"
                      >
                        {covenant.description}
                      </Badge>
                    ))}
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