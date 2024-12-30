'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import type { Borrower } from '@/types/borrower'

interface BorrowerDetailsModalProps {
  borrower: Borrower | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
}

export function BorrowerDetailsModal({ borrower, open, onOpenChange, onEdit }: BorrowerDetailsModalProps) {
  if (!borrower) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-4">
              <span>{borrower.name}</span>
              <div className="flex gap-2">
                <Badge variant={borrower.onboardingStatus === 'COMPLETED' ? 'success' : 'secondary'}>
                  {borrower.onboardingStatus}
                </Badge>
                <Badge variant={borrower.kycStatus === 'COMPLETED' ? 'success' : 'secondary'}>
                  {borrower.kycStatus}
                </Badge>
              </div>
            </DialogTitle>
            {onEdit && (
              <Button onClick={onEdit} variant="outline">
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-8rem)]">
          <div className="space-y-6 pr-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                {borrower.taxId && (
                  <div>
                    <Label className="text-muted-foreground">Tax ID</Label>
                    <div>{borrower.taxId}</div>
                  </div>
                )}
                {borrower.countryOfIncorporation && (
                  <div>
                    <Label className="text-muted-foreground">Country of Incorporation</Label>
                    <div>{borrower.countryOfIncorporation}</div>
                  </div>
                )}
                {borrower.industrySegment && (
                  <div>
                    <Label className="text-muted-foreground">Industry Segment</Label>
                    <div>{borrower.industrySegment}</div>
                  </div>
                )}
                {borrower.businessType && (
                  <div>
                    <Label className="text-muted-foreground">Business Type</Label>
                    <div>{borrower.businessType}</div>
                  </div>
                )}
                {borrower.creditRating && (
                  <div>
                    <Label className="text-muted-foreground">Credit Rating</Label>
                    <div>{borrower.creditRating}</div>
                  </div>
                )}
                {borrower.ratingAgency && (
                  <div>
                    <Label className="text-muted-foreground">Rating Agency</Label>
                    <div>{borrower.ratingAgency}</div>
                  </div>
                )}
                {borrower.riskRating && (
                  <div>
                    <Label className="text-muted-foreground">Risk Rating</Label>
                    <div>{borrower.riskRating}</div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Status Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Status Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Onboarding Status</Label>
                  <div>
                    <Badge variant={borrower.onboardingStatus === 'COMPLETED' ? 'success' : 'secondary'}>
                      {borrower.onboardingStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">KYC Status</Label>
                  <div>
                    <Badge variant={borrower.kycStatus === 'COMPLETED' ? 'success' : 'secondary'}>
                      {borrower.kycStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <div>{format(borrower.createdAt, 'PPP')}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <div>{format(borrower.updatedAt, 'PPP')}</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 