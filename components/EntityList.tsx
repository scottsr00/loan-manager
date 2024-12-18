'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { EntityDetailsModal } from './EntityDetailsModal'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef } from 'ag-grid-community'

interface EntityListProps {
  entities: any[]
}

export function EntityList({ entities }: EntityListProps) {
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'legalName',
      headerName: 'Legal Name',
      width: 250,
      valueFormatter: (params) => {
        const dba = params.data.dba
        return dba ? `${params.value} (DBA: ${dba})` : params.value
      },
    },
    {
      field: 'entityType.name',
      headerName: 'Type',
      width: 150,
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
      headerName: 'Primary Contact',
      width: 200,
      valueGetter: (params) => {
        const primaryContact = params.data.contacts[0]
        if (!primaryContact) return 'No primary contact'
        const contactInfo = `${primaryContact.firstName} ${primaryContact.lastName}`
        return primaryContact.title ? `${contactInfo}\n${primaryContact.title}` : contactInfo
      },
    },
    {
      headerName: 'Location',
      width: 200,
      valueGetter: (params) => {
        const primaryAddress = params.data.addresses[0]
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

  return (
    <>
      <DataGrid
        rowData={entities}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          floatingFilter: true,
        }}
        onRowClick={(data) => {
          setSelectedEntity(data)
          setDetailsOpen(true)
        }}
        domLayout="autoHeight"
      />

      <EntityDetailsModal
        entity={selectedEntity}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  )
} 