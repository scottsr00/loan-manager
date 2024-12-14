'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreditAgreementWithRelations } from '@/app/actions/getCreditAgreements'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

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

  const latestFinancials = creditAgreement.borrower.financialStatements[0]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Credit Agreement Details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Agreement Name</p>
                <p className="text-sm text-muted-foreground">{creditAgreement.agreementName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Agreement Number</p>
                <p className="text-sm text-muted-foreground">{creditAgreement.agreementNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={creditAgreement.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {creditAgreement.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(creditAgreement.totalAmount)} {creditAgreement.currency}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Effective Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(creditAgreement.effectiveDate), 'PP')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Maturity Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(creditAgreement.maturityDate), 'PP')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Borrower Information */}
          <Card>
            <CardHeader>
              <CardTitle>Borrower Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Legal Name</p>
                  <p className="text-sm text-muted-foreground">{creditAgreement.borrower.entity.legalName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Registration Number</p>
                  <p className="text-sm text-muted-foreground">{creditAgreement.borrower.entity.registrationNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Credit Rating</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {creditAgreement.borrower.creditRating || 'No Rating'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({creditAgreement.borrower.ratingAgency || 'N/A'})
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Watch Status</p>
                  <Badge variant={creditAgreement.borrower.watchStatus === 'NONE' ? 'secondary' : 'warning'}>
                    {creditAgreement.borrower.watchStatus || 'NONE'}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Compliance Status */}
              <div>
                <h4 className="text-sm font-medium mb-2">Compliance Status</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">KYC Status</p>
                    <Badge variant={creditAgreement.borrower.kycStatus === 'APPROVED' ? 'success' : 'warning'}>
                      {creditAgreement.borrower.kycStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">AML Status</p>
                    <Badge variant={creditAgreement.borrower.amlStatus === 'CLEARED' ? 'success' : 'warning'}>
                      {creditAgreement.borrower.amlStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Documentation</p>
                    <Badge variant={creditAgreement.borrower.documentationStatus === 'COMPLETE' ? 'success' : 'warning'}>
                      {creditAgreement.borrower.documentationStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              {latestFinancials && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Latest Financial Information</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-sm font-medium">{formatCurrency(latestFinancials.revenue || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">EBITDA</p>
                        <p className="text-sm font-medium">{formatCurrency(latestFinancials.ebitda || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Net Income</p>
                        <p className="text-sm font-medium">{formatCurrency(latestFinancials.netIncome || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Assets</p>
                        <p className="text-sm font-medium">{formatCurrency(latestFinancials.totalAssets || 0)}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      As of {format(new Date(latestFinancials.periodEnd), 'PP')} ({latestFinancials.auditStatus})
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditAgreement.facilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="grid grid-cols-2 gap-4 p-4 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">{facility.facilityName}</p>
                      <Badge variant="outline" className="mt-1">
                        {facility.facilityType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(facility.commitmentAmount)} {facility.currency}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {facility.baseRate} + {facility.margin}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Covenants */}
          <Card>
            <CardHeader>
              <CardTitle>Covenants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditAgreement.borrower.covenants.map((covenant) => (
                  <div
                    key={covenant.id}
                    className="grid grid-cols-2 gap-4 p-4 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">{covenant.description}</p>
                      <Badge variant="outline" className="mt-1">
                        {covenant.covenantType}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant={covenant.status === 'COMPLIANT' ? 'success' : 'destructive'}>
                        {covenant.status}
                      </Badge>
                      {covenant.threshold && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Threshold: {covenant.threshold}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditAgreement.borrower.requiredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="grid grid-cols-2 gap-4 p-4 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">{doc.documentType}</p>
                      {doc.documentUrl && (
                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                    <div>
                      <Badge
                        variant={
                          doc.status === 'APPROVED'
                            ? 'success'
                            : doc.status === 'REJECTED'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {doc.status}
                      </Badge>
                      {doc.expirationDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires: {format(new Date(doc.expirationDate), 'PP')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 