'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { CreditAgreement, Borrower, Lender, Facility } from '@prisma/client'

type CreditAgreementWithRelations = CreditAgreement & {
  borrower: Borrower;
  lender: Lender;
  facilities: Facility[];
}

interface CreditAgreementDetailsModalProps {
  creditAgreement: CreditAgreementWithRelations | null
  isOpen: boolean
  onClose: () => void
}

export function CreditAgreementDetailsModal({
  creditAgreement,
  isOpen,
  onClose,
}: CreditAgreementDetailsModalProps) {
  if (!creditAgreement) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{creditAgreement.agreementName}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{creditAgreement.agreementNumber}</Badge>
            <Badge variant={creditAgreement.status === 'ACTIVE' ? 'success' : 'secondary'}>
              {creditAgreement.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Agreement Details */}
          <Card>
            <CardHeader>
              <CardTitle>Agreement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <p>{formatCurrency(creditAgreement.amount)} {creditAgreement.currency}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Interest Rate:</span>
                <p>{creditAgreement.interestRate}%</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Start Date:</span>
                <p>{format(new Date(creditAgreement.startDate), 'PPP')}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Maturity Date:</span>
                <p>{format(new Date(creditAgreement.maturityDate), 'PPP')}</p>
              </div>
              {creditAgreement.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p>{creditAgreement.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Borrower Information */}
          <Card>
            <CardHeader>
              <CardTitle>Borrower Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p>{creditAgreement.borrower.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="outline">{creditAgreement.borrower.type}</Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={creditAgreement.borrower.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {creditAgreement.borrower.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Lender Information */}
          <Card>
            <CardHeader>
              <CardTitle>Lender Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p>{creditAgreement.lender.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="outline">{creditAgreement.lender.type}</Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={creditAgreement.lender.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {creditAgreement.lender.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              {creditAgreement.facilities.length > 0 ? (
                <div className="space-y-4">
                  {creditAgreement.facilities.map((facility) => (
                    <div key={facility.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{facility.facilityName}</h4>
                          <Badge variant="outline" className="mt-1">
                            {facility.facilityType}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(facility.commitmentAmount)} {facility.currency}</p>
                          <p className="text-sm text-muted-foreground">
                            {facility.baseRate} + {facility.margin}%
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Start Date:</span>
                          <p>{format(new Date(facility.startDate), 'PP')}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Maturity Date:</span>
                          <p>{format(new Date(facility.maturityDate), 'PP')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No facilities have been added to this agreement.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 