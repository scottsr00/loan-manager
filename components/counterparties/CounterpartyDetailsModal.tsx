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
import { type CounterpartyWithRelations } from '@/types/counterparty'
import { useState } from 'react'
import { updateKYCStatus } from '@/server/actions/kyc/updateKYCStatus'
import { toast } from 'sonner'

interface CounterpartyDetailsModalProps {
  counterparty: CounterpartyWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CounterpartyDetailsModal({
  counterparty,
  open,
  onOpenChange,
}: CounterpartyDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState(counterparty?.kyc?.verificationStatus || 'PENDING')
  const [counterpartyVerified, setCounterpartyVerified] = useState(counterparty?.kyc?.counterpartyVerified || false)

  if (!counterparty) return null

  const handleUpdateKYC = async () => {
    try {
      setIsUpdating(true)
      await updateKYCStatus({
        entityId: counterparty.entityId,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Counterparty Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">General Information</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span>{counterparty.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>{counterparty.type.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={counterparty.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {counterparty.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{format(new Date(counterparty.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{format(new Date(counterparty.updatedAt), 'MMM d, yyyy')}</span>
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
              {counterparty.contacts.find(c => c.isPrimary) ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>
                      {counterparty.contacts.find(c => c.isPrimary)?.firstName}{' '}
                      {counterparty.contacts.find(c => c.isPrimary)?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{counterparty.contacts.find(c => c.isPrimary)?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{counterparty.contacts.find(c => c.isPrimary)?.phone || 'N/A'}</span>
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
              {counterparty.addresses.find(a => a.isPrimary) ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Street:</span>
                    <span>
                      {counterparty.addresses.find(a => a.isPrimary)?.street1}
                      {counterparty.addresses.find(a => a.isPrimary)?.street2 && (
                        <>, {counterparty.addresses.find(a => a.isPrimary)?.street2}</>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span>{counterparty.addresses.find(a => a.isPrimary)?.city}</span>
                  </div>
                  {counterparty.addresses.find(a => a.isPrimary)?.state && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">State:</span>
                      <span>{counterparty.addresses.find(a => a.isPrimary)?.state}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span>{counterparty.addresses.find(a => a.isPrimary)?.country}</span>
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