'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { getFacility, type FacilityWithRelations } from '@/server/actions/facility/getFacility'
import { Loader2 } from 'lucide-react'

interface FacilityDetailsModalProps {
  facilityId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FacilityDetailsModal({
  facilityId,
  open,
  onOpenChange,
}: FacilityDetailsModalProps) {
  const [facility, setFacility] = useState<FacilityWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open && facilityId) {
      setIsLoading(true)
      getFacility(facilityId)
        .then(data => {
          setFacility(data)
          setIsLoading(false)
        })
        .catch(error => {
          console.error('Error loading facility:', error)
          setIsLoading(false)
        })
    }
  }, [facilityId, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Facility Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !facility ? (
          <div className="py-4 text-center text-muted-foreground">
            Facility not found
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Facility Name</label>
                  <p>{facility.facilityName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p>{facility.facilityType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Credit Agreement</label>
                  <p>{facility.creditAgreement.agreementNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Borrower</label>
                  <p>{facility.creditAgreement.borrower?.name}</p>
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
                  <p>{formatCurrency(facility.commitmentAmount)} {facility.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Available Amount</label>
                  <p>{formatCurrency(facility.availableAmount)} {facility.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Interest Type</label>
                  <p>{facility.interestType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Interest Rate</label>
                  <p>{facility.baseRate} + {facility.margin}%</p>
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
                  <p>{format(new Date(facility.startDate), 'PP')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Maturity Date</label>
                  <p>{format(new Date(facility.maturityDate), 'PP')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Positions */}
            <Card>
              <CardHeader>
                <CardTitle>Lender Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {facility.positions.map(position => (
                    <div key={position.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{position.lender.entity.legalName}</p>
                        <Badge variant="outline" className="mt-1">
                          {position.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p>{formatCurrency(position.amount)} {facility.currency}</p>
                        <p className="text-sm text-muted-foreground">
                          {(position.share * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 