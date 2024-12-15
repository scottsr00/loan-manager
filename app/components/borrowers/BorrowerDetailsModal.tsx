"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useBorrowers } from '@/hooks/useBorrowers'
import type { Borrower } from "@/types/borrower"

type BorrowerDetailsModalProps = {
  borrower: Borrower
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BorrowerDetailsModal({
  borrower,
  open,
  onOpenChange,
}: BorrowerDetailsModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { remove } = useBorrowers()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await remove(borrower.id)
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting borrower:", error)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrower Details</DialogTitle>
            <DialogDescription>
              View and manage borrower information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Name</h4>
              <p className="text-sm text-muted-foreground">{borrower.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Tax ID</h4>
              <p className="text-sm text-muted-foreground">{borrower.taxId}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Jurisdiction</h4>
              <p className="text-sm text-muted-foreground">
                {borrower.jurisdiction}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Industry</h4>
              <p className="text-sm text-muted-foreground">{borrower.industry}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Credit Rating</h4>
              <p className="text-sm text-muted-foreground">
                {borrower.creditRating} ({borrower.ratingAgency})
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Status</h4>
              <p className="text-sm text-muted-foreground">
                Onboarding: {borrower.onboardingStatus}<br />
                KYC: {borrower.kycStatus}
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Borrower
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              borrower and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 