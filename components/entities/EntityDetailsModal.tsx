'use client'

import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { type EntityWithRelations } from '@/server/types/entity'
import { useState } from 'react'
import { updateKYCStatus } from '@/server/actions/kyc/updateKYCStatus'
import { toast } from 'sonner'

interface EntityDetailsModalProps {
  entity: EntityWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntityDetailsModal({
  entity,
  open,
  onOpenChange,
}: EntityDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState(entity?.kyc?.verificationStatus || 'PENDING')
  const [counterpartyVerified, setCounterpartyVerified] = useState(entity?.kyc?.counterpartyVerified || false)

  if (!entity) return null

  const handleUpdateKYC = async () => {
    try {
      setIsUpdating(true)
      await updateKYCStatus({
        entityId: entity.id,
        verificationStatus,
        counterpartyVerified
      })
      toast.success('KYC status updated successfully')
    } catch (error) {
      console.error('Error updating KYC status:', error)
      toast.error('Failed to update KYC status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getRelationshipBadges = () => {
    const relationships = []
    if (entity.isLender) relationships.push('Lender')
    if (entity.isBorrower) relationships.push('Borrower')
    if (entity.isCounterparty) relationships.push('Counterparty')
    if (entity.isAgent) relationships.push('Agent')

    return relationships.map(rel => (
      <Badge key={rel} variant="outline">
        {rel}
      </Badge>
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Entity Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">General Information</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Legal Name:</span>
                <span>{entity.legalName}</span>
              </div>
              {entity.dba && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DBA:</span>
                  <span>{entity.dba}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jurisdiction:</span>
                <span>{entity.jurisdiction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={entity.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {entity.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Relationships:</span>
                <div className="flex gap-2">
                  {getRelationshipBadges()}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{format(new Date(entity.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{format(new Date(entity.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium">KYC Status</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verification Status:</span>
                <Select
                  value={verificationStatus}
                  onValueChange={setVerificationStatus}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Counterparty Verification:</span>
                <Select
                  value={counterpartyVerified ? 'true' : 'false'}
                  onValueChange={(value) => setCounterpartyVerified(value === 'true')}
                  disabled={isUpdating || verificationStatus !== 'VERIFIED'}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Not Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateKYC}
                  disabled={isUpdating}
                >
                  Update KYC Status
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium">Primary Contact</h3>
            <div className="mt-2 space-y-2">
              {entity.contacts[0] ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>
                      {entity.contacts[0].firstName} {entity.contacts[0].lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{entity.contacts[0].email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{entity.contacts[0].phone || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">No primary contact found</div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium">Primary Address</h3>
            <div className="mt-2 space-y-2">
              {entity.addresses[0] ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Street:</span>
                    <span>
                      {entity.addresses[0].street1}
                      {entity.addresses[0].street2 && (
                        <>, {entity.addresses[0].street2}</>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span>{entity.addresses[0].city}</span>
                  </div>
                  {entity.addresses[0].state && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">State:</span>
                      <span>{entity.addresses[0].state}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span>{entity.addresses[0].country}</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">No primary address found</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 