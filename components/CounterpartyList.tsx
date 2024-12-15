'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CounterpartyDetailsModal } from './CounterpartyDetailsModal'

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

export function CounterpartyList() {
  const [selectedCounterparty, setSelectedCounterparty] = useState<Counterparty | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Legal Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Primary Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No counterparties found
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <CounterpartyDetailsModal 
        counterparty={selectedCounterparty}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  )
} 