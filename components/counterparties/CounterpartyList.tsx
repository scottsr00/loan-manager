'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { CounterpartyDetailsModal } from './CounterpartyDetailsModal'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type RowClickedEvent } from 'ag-grid-community'
import { type CounterpartyWithRelations, type CounterpartyAddress, type CounterpartyContact } from '@/types/counterparty'
import '@/lib/ag-grid-init'

interface CounterpartyListProps {
  counterparties: CounterpartyWithRelations[]
}

export function CounterpartyList({ counterparties }: CounterpartyListProps) {
  const [selectedCounterparty, setSelectedCounterparty] = useState<CounterpartyWithRelations | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'entity.legalName',
      headerName: 'Name',
      width: 250,
    },
    {
      field: 'type.name',
      headerName: 'Type',
      width: 150,
    },
    {
      field: 'tradingStatus',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'ACTIVE' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      ),
    },
    {
      headerName: 'Primary Contact',
      width: 200,
      valueGetter: (params) => {
        const primaryContact = params.data.contacts.find((c: CounterpartyContact) => c.isPrimary)
        if (!primaryContact) return 'No primary contact'
        return `${primaryContact.firstName} ${primaryContact.lastName}`
      },
    },
    {
      headerName: 'Primary Address',
      width: 200,
      valueGetter: (params) => {
        const primaryAddress = params.data.addresses.find((a: CounterpartyAddress) => a.isPrimary)
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
      valueFormatter: (params) => format(new Date(params.value), 'MMM d, yyyy'),
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