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
import { Borrower } from "./columns"
import { useSWRConfig } from "swr"
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
  const { mutate } = useSWRConfig()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/borrowers/${borrower.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete borrower")
      }

      await mutate("/api/borrowers")
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