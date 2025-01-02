'use client'

import '@/lib/ag-grid-init'
import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { EntityDetailsModal } from './EntityDetailsModal'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type ICellRendererParams } from 'ag-grid-community'
import { type EntityWithRelations } from '@/server/types/entity'

interface EntityListProps {
  entities: EntityWithRelations[]
}

export function EntityList({ entities }: EntityListProps) {
  const [selectedEntity, setSelectedEntity] = useState<EntityWithRelations | null>(null)
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
      field: 'relationships',
      headerName: 'Relationships',
      width: 200,
      cellRenderer: (params: ICellRendererParams) => {
        const relationships = []
        if (params.data.isLender) relationships.push('Lender')
        if (params.data.isBorrower) relationships.push('Borrower')
        if (params.data.isCounterparty) relationships.push('Counterparty')
        if (params.data.isAgent) relationships.push('Agent')

        return (
          <div className="flex flex-wrap gap-1">
            {relationships.map(rel => (
              <Badge key={rel} variant="outline" className="text-xs">
                {rel}
              </Badge>
            ))}
          </div>
        )
      }
    },
    {
      field: 'kyc',
      headerName: 'KYC Status',
      width: 200,
      cellRenderer: (params: ICellRendererParams) => {
        const kyc = params.value || {
          verificationStatus: 'PENDING',
          counterpartyVerified: false
        }
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
      field: 'jurisdiction',
      headerName: 'Jurisdiction',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: ICellRendererParams) => (
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
        onRowClick={(params) => {
          setSelectedEntity(params.data)
          setDetailsOpen(true)
        }}
        className="h-[600px]"
      />

      {selectedEntity && (
        <EntityDetailsModal
          entity={selectedEntity}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  )
} 