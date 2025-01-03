'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { CounterpartyDetailsModal } from './CounterpartyDetailsModal'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type RowClickedEvent } from 'ag-grid-community'
import { type CounterpartyWithRelations } from '@/types/counterparty'
import '@/lib/ag-grid-init'

interface CounterpartyListProps {
  counterparties: CounterpartyWithRelations[]
}

export function CounterpartyList({ counterparties }: CounterpartyListProps) {
  const [selectedCounterparty, setSelectedCounterparty] = useState<CounterpartyWithRelations | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'name',
      headerName: 'Name',
      width: 250,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'ACTIVE' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'kyc',
      headerName: 'KYC Status',
      width: 200,
      cellRenderer: (params: any) => {
        const kyc = params.value
        const variant = kyc.verificationStatus === 'VERIFIED' && kyc.counterpartyVerified
          ? 'success'
          : kyc.verificationStatus === 'REJECTED'
            ? 'destructive'
            : 'secondary'
        
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={variant}>
              {kyc.verificationStatus}
            </Badge>
            {kyc.verificationStatus === 'VERIFIED' && !kyc.counterpartyVerified && (
              <Badge variant="outline">
                Pending Counterparty Verification
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      field: 'primaryContact',
      headerName: 'Primary Contact',
      width: 200,
      valueGetter: (params) => {
        if (!params.data?.contacts) return 'No contacts'
        const primaryContact = params.data.contacts.find((c: any) => c.isPrimary)
        if (!primaryContact) return 'No primary contact'
        return `${primaryContact.firstName} ${primaryContact.lastName}`
      },
    },
    {
      headerName: 'Primary Address',
      width: 200,
      valueGetter: (params) => {
        if (!params.data?.addresses) return 'No addresses'
        const primaryAddress = params.data.addresses.find((a: any) => a.isPrimary)
        if (!primaryAddress) return 'No primary address'
        return primaryAddress.state 
          ? `${primaryAddress.city}, ${primaryAddress.state}, ${primaryAddress.country}`
          : `${primaryAddress.city}, ${primaryAddress.country}`
      },
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return ''
        try {
          return format(new Date(params.value), 'MMM d, yyyy')
        } catch (error) {
          console.error('Error formatting date:', error)
          return 'Invalid date'
        }
      },
      filter: 'agDateColumnFilter',
    },
  ], [])

  const handleRowClick = (event: RowClickedEvent<CounterpartyWithRelations>) => {
    if (event.data) {
      setSelectedCounterparty(event.data)
      setDetailsOpen(true)
    }
  }

  return (
    <>
      <DataGrid
        rowData={counterparties}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          floatingFilter: true,
        }}
        onRowClick={handleRowClick}
      />

      <CounterpartyDetailsModal
        counterparty={selectedCounterparty}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  )
} 