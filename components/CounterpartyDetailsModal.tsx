'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CounterpartyWithRelations } from '@/app/actions/getCounterparties'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteCounterparty } from '@/app/actions/deleteCounterparty'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CounterpartyDetailsModalProps {
  counterparty: CounterpartyWithRelations | null
  onClose: () => void
  onDelete?: (counterparty: CounterpartyWithRelations) => void
}

export function CounterpartyDetailsModal({ 
  counterparty, 
  onClose,
  onDelete 
}: CounterpartyDetailsModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!counterparty) return null

  const primaryAddress = counterparty.addresses.find(a => a.isPrimary)
  const primaryContact = counterparty.contacts.find(c => c.isPrimary)

  const handleDelete = async () => {
    if (!counterparty || isDeleting) return
    
    setIsDeleting(true)
    try {
      const result = await deleteCounterparty(counterparty.id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete counterparty')
      }
      
      toast.success('Counterparty deleted successfully')
      onDelete?.(counterparty)
      onClose()
    } catch (error) {
      console.error('Error deleting counterparty:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete counterparty'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const getKycStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getOnboardingStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'new':
        return 'bg-yellow-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <>
      <Dialog open={!!counterparty} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl">{counterparty.legalName}</DialogTitle>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogHeader>

          <div className="grid gap-6 mt-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p>{counterparty.counterpartyType.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Parent Name</label>
                  <p>{counterparty.parentName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ultimate Parent</label>
                  <p>{counterparty.ultParentName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                  <p>{counterparty.registrationNumber || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tax ID</label>
                  <p>{counterparty.taxId || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Website</label>
                  <p>
                    {counterparty.website ? (
                      <a
                        href={counterparty.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {counterparty.website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">KYC Status</label>
                  <div className="mt-1">
                    <Badge className={getKycStatusColor(counterparty.kycStatus)}>
                      {counterparty.kycStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Onboarding Status</label>
                  <div className="mt-1">
                    <Badge className={getOnboardingStatusColor(counterparty.onboardingStatus)}>
                      {counterparty.onboardingStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Address */}
            {primaryAddress && (
              <Card>
                <CardHeader>
                  <CardTitle>Primary Address</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Street</label>
                    <p>{primaryAddress.street1}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <p>{primaryAddress.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">State</label>
                    <p>{primaryAddress.state || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                    <p>{primaryAddress.country}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Primary Contact */}
            {primaryContact && (
              <Card>
                <CardHeader>
                  <CardTitle>Primary Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p>{`${primaryContact.firstName} ${primaryContact.lastName}`}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p>{primaryContact.title || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>
                      {primaryContact.email ? (
                        <a
                          href={`mailto:${primaryContact.email}`}
                          className="text-blue-500 hover:underline"
                        >
                          {primaryContact.email}
                        </a>
                      ) : (
                        '-'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p>{primaryContact.phone || '-'}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {counterparty.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{counterparty.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the counterparty "{counterparty.legalName}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 