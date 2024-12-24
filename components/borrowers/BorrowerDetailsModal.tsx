"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import type { Borrower } from '@/types/borrower'

interface BorrowerDetailsModalProps {
  borrower: Borrower | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BorrowerDetailsModal({ borrower, open, onOpenChange }: BorrowerDetailsModalProps) {
  if (!borrower) return null

  const primaryAddress = borrower.entity.addresses[0]
  const primaryContact = borrower.entity.contacts[0]
  const primaryBeneficialOwner = borrower.entity.beneficialOwners[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{borrower.entity.legalName}</span>
            <div className="flex gap-2">
              <Badge variant={borrower.onboardingStatus === 'COMPLETED' ? 'success' : 'secondary'}>
                {borrower.onboardingStatus}
              </Badge>
              <Badge variant={borrower.kycStatus === 'COMPLETED' ? 'success' : 'secondary'}>
                {borrower.kycStatus}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-8rem)]">
          <div className="space-y-6 pr-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                {borrower.entity.dba && (
                  <div>
                    <Label className="text-muted-foreground">DBA</Label>
                    <div>{borrower.entity.dba}</div>
                  </div>
                )}
                {borrower.entity.registrationNumber && (
                  <div>
                    <Label className="text-muted-foreground">Registration Number</Label>
                    <div>{borrower.entity.registrationNumber}</div>
                  </div>
                )}
                {borrower.entity.taxId && (
                  <div>
                    <Label className="text-muted-foreground">Tax ID</Label>
                    <div>{borrower.entity.taxId}</div>
                  </div>
                )}
                {borrower.entity.countryOfIncorporation && (
                  <div>
                    <Label className="text-muted-foreground">Country of Incorporation</Label>
                    <div>{borrower.entity.countryOfIncorporation}</div>
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
              </div>
            </div>

            <Separator />

            {/* Risk Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Risk Information</h4>
              <div className="grid grid-cols-2 gap-4">
                {borrower.creditRating && (
                  <div>
                    <Label className="text-muted-foreground">Credit Rating</Label>
                    <div>
                      {borrower.creditRating}
                      {borrower.ratingAgency && ` (${borrower.ratingAgency})`}
                    </div>
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

            {/* Primary Address */}
            {primaryAddress && (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium">Primary Address</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Street Address</Label>
                      <div>{primaryAddress.street1}</div>
                      {primaryAddress.street2 && <div>{primaryAddress.street2}</div>}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">City</Label>
                      <div>{primaryAddress.city}</div>
                    </div>
                    {primaryAddress.state && (
                      <div>
                        <Label className="text-muted-foreground">State</Label>
                        <div>{primaryAddress.state}</div>
                      </div>
                    )}
                    {primaryAddress.postalCode && (
                      <div>
                        <Label className="text-muted-foreground">Postal Code</Label>
                        <div>{primaryAddress.postalCode}</div>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Country</Label>
                      <div>{primaryAddress.country}</div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Primary Contact */}
            {primaryContact && (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium">Primary Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <div>{`${primaryContact.firstName} ${primaryContact.lastName}`}</div>
                    </div>
                    {primaryContact.title && (
                      <div>
                        <Label className="text-muted-foreground">Title</Label>
                        <div>{primaryContact.title}</div>
                      </div>
                    )}
                    {primaryContact.email && (
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <div>{primaryContact.email}</div>
                      </div>
                    )}
                    {primaryContact.phone && (
                      <div>
                        <Label className="text-muted-foreground">Phone</Label>
                        <div>{primaryContact.phone}</div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Beneficial Owner */}
            {primaryBeneficialOwner && (
              <div className="space-y-4">
                <h4 className="font-medium">Primary Beneficial Owner</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <div>{primaryBeneficialOwner.name}</div>
                  </div>
                  {primaryBeneficialOwner.dateOfBirth && (
                    <div>
                      <Label className="text-muted-foreground">Date of Birth</Label>
                      <div>{format(new Date(primaryBeneficialOwner.dateOfBirth), 'PP')}</div>
                    </div>
                  )}
                  {primaryBeneficialOwner.nationality && (
                    <div>
                      <Label className="text-muted-foreground">Nationality</Label>
                      <div>{primaryBeneficialOwner.nationality}</div>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Ownership</Label>
                    <div>{primaryBeneficialOwner.ownershipPercentage}%</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Control Type</Label>
                    <div>{primaryBeneficialOwner.controlType}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Verification Status</Label>
                    <div>{primaryBeneficialOwner.verificationStatus}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
} 