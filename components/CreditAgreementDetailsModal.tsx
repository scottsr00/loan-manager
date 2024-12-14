'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreditAgreementWithRelations } from '@/app/actions/getCreditAgreements'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

interface CreditAgreementDetailsModalProps {
  creditAgreement: CreditAgreementWithRelations | null
  isOpen: boolean
  onClose: () => void
}

export function CreditAgreementDetailsModal({
  creditAgreement,
  isOpen,
  onClose
}: CreditAgreementDetailsModalProps) {
  if (!creditAgreement) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Credit Agreement Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm">Agreement ID</h3>
              <p className="text-sm text-muted-foreground">{creditAgreement.id}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Status</h3>
              <Badge variant={creditAgreement.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {creditAgreement.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm">Bank</h3>
              <p className="text-sm text-muted-foreground">{creditAgreement.bank.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Borrower</h3>
              <p className="text-sm text-muted-foreground">{creditAgreement.borrower.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm">Start Date</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(creditAgreement.startDate), 'PP')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Maturity Date</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(creditAgreement.maturityDate), 'PP')}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-2">Facilities</h3>
            {creditAgreement.facilities.length > 0 ? (
              <div className="space-y-2">
                {creditAgreement.facilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="p-3 rounded-lg border bg-card text-card-foreground"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{facility.type}</p>
                        <p className="text-xs text-muted-foreground">ID: {facility.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(facility.amount)}
                        </p>
                        <Badge variant={facility.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {facility.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No facilities found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 