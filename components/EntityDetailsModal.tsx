'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { type EntityWithRelations } from '@/server/types/entity'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'

interface EntityDetailsModalProps {
  entity: EntityWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntityDetailsModal({ entity, open, onOpenChange }: EntityDetailsModalProps) {
  if (!entity) return null

  const primaryAddress = entity.addresses?.[0]
  const primaryContact = entity.contacts?.[0]
  const primaryBeneficialOwner = entity.beneficialOwners?.[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{entity.legalName}</span>
            <Badge variant={entity.status === 'ACTIVE' ? 'success' : 'secondary'}>
              {entity.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[calc(80vh-8rem)] overflow-y-auto pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                {entity.dba && (
                  <div>
                    <Label className="text-muted-foreground">DBA</Label>
                    <div>{entity.dba}</div>
                  </div>
                )}
                {entity.registrationNumber && (
                  <div>
                    <Label className="text-muted-foreground">Registration Number</Label>
                    <div>{entity.registrationNumber}</div>
                  </div>
                )}
                {entity.taxId && (
                  <div>
                    <Label className="text-muted-foreground">Tax ID</Label>
                    <div>{entity.taxId}</div>
                  </div>
                )}
                {entity.dateOfIncorporation && (
                  <div>
                    <Label className="text-muted-foreground">Date of Incorporation</Label>
                    <div>{format(new Date(entity.dateOfIncorporation), 'PP')}</div>
                  </div>
                )}
                {entity.jurisdiction && (
                  <div>
                    <Label className="text-muted-foreground">Jurisdiction</Label>
                    <div>{entity.jurisdiction}</div>
                  </div>
                )}
                {entity.governmentId && (
                  <div>
                    <Label className="text-muted-foreground">Government ID</Label>
                    <div>{entity.governmentId} ({entity.governmentIdType})</div>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Address */}
            {primaryAddress && (
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
                  <div>
                    <Label className="text-muted-foreground">State</Label>
                    <div>{primaryAddress.state || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Postal Code</Label>
                    <div>{primaryAddress.postalCode || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Country</Label>
                    <div>{primaryAddress.country}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Contact */}
            {primaryContact && (
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
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <div>{primaryContact.email || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <div>{primaryContact.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Beneficial Owner */}
            {primaryBeneficialOwner && (
              <div className="space-y-4">
                <h4 className="font-medium">Beneficial Owner</h4>
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
        </div>
      </DialogContent>
    </Dialog>
  )
} 