'use client'

import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface FacilityDetailsModalProps {
  facility: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FacilityDetailsModal({
  facility,
  open,
  onOpenChange,
}: FacilityDetailsModalProps) {
  if (!facility) return null

  const facilityData = facility.data || facility

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Facility Details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Facility Name</label>
                <p>{facilityData.facilityName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p>{facilityData.facilityType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Credit Agreement</label>
                <p>{facilityData.creditAgreement?.agreementName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Borrower</label>
                <p>{facilityData.creditAgreement?.borrower?.entity?.legalName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={facilityData.status === 'ACTIVE' ? 'success' : 'default'}>
                    {facilityData.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Commitment Amount</label>
                <p>{formatCurrency(facilityData.commitmentAmount)} {facilityData.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Available Amount</label>
                <p>{formatCurrency(facilityData.availableAmount)} {facilityData.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Interest Type</label>
                <p>{facilityData.interestType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Interest Rate</label>
                <p>{facilityData.baseRate} + {facilityData.margin}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p>{facilityData.startDate ? format(new Date(facilityData.startDate), 'PP') : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Maturity Date</label>
                <p>{facilityData.maturityDate ? format(new Date(facilityData.maturityDate), 'PP') : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 