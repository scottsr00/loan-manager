'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Counterparty {
  id: string
  legalName: string
  counterpartyType: {
    name: string
  }
  addresses: Array<{
    street1: string
    city: string
    state: string | null
    country: string
  }>
  contacts: Array<{
    firstName: string
    lastName: string
    title: string | null
    email: string | null
  }>
}

interface CounterpartyDetailsModalProps {
  counterparty: Counterparty | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CounterpartyDetailsModal({
  counterparty,
  open,
  onOpenChange,
}: CounterpartyDetailsModalProps) {
  if (!counterparty) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Counterparty Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Details coming soon...</p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 