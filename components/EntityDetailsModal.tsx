'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Entity } from '@prisma/client'

interface EntityDetailsModalProps {
  entity: Entity & {
    entityType: { name: string }
    addresses: Array<{ streetAddress: string; city: string; state: string; postalCode: string }>
    contacts: Array<{ name: string; email: string; phone: string }>
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntityDetailsModal({ entity, open, onOpenChange }: EntityDetailsModalProps) {
  if (!entity) return null

  const primaryAddress = entity.addresses[0]
  const primaryContact = entity.contacts[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{entity.legalName}</span>
            <Badge variant={entity.status === 'ACTIVE' ? 'default' : 'secondary'}>
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
                <div>
                  <Label className="text-muted-foreground">Entity Type</Label>
                  <div>{entity.entityType.name}</div>
                </div>
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
              </div>
            </div>

            {/* Primary Address */}
            {primaryAddress && (
              <div className="space-y-4">
                <h4 className="font-medium">Primary Address</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Street Address</Label>
                    <div>{primaryAddress.streetAddress}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">City</Label>
                    <div>{primaryAddress.city}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">State</Label>
                    <div>{primaryAddress.state}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Postal Code</Label>
                    <div>{primaryAddress.postalCode}</div>
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
                    <div>{primaryContact.name}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <div>{primaryContact.email}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <div>{primaryContact.phone}</div>
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