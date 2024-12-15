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
import { useCounterparties } from '@/hooks/useCounterparties'
import { Loader2 } from 'lucide-react'
import type { Counterparty } from '@/types/counterparty'

export function CounterpartyList() {
  const [selectedCounterparty, setSelectedCounterparty] = useState<Counterparty | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { counterparties, isLoading, isError } = useCounterparties()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center p-8 text-destructive">
        Error loading counterparties. Please try again later.
      </div>
    )
  }

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
          {!counterparties?.length ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No counterparties found
              </TableCell>
            </TableRow>
          ) : (
            counterparties.map((counterparty) => {
              const primaryContact = counterparty.contacts.find(c => c.isPrimary)
              const primaryAddress = counterparty.addresses.find(a => a.isPrimary)
              
              return (
                <TableRow 
                  key={counterparty.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedCounterparty(counterparty)
                    setDetailsOpen(true)
                  }}
                >
                  <TableCell>{counterparty.legalName}</TableCell>
                  <TableCell>{counterparty.counterpartyType.name}</TableCell>
                  <TableCell>
                    <Badge variant={counterparty.kycStatus === 'Approved' ? 'success' : 'warning'}>
                      {counterparty.kycStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {primaryContact ? (
                      <div className="text-sm">
                        <div>{`${primaryContact.firstName} ${primaryContact.lastName}`}</div>
                        {primaryContact.email && (
                          <div className="text-muted-foreground">{primaryContact.email}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No primary contact</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {primaryAddress ? (
                      <div className="text-sm">
                        <div>{primaryAddress.city}</div>
                        <div className="text-muted-foreground">{primaryAddress.country}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No primary address</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(counterparty.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              )
            })
          )}
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