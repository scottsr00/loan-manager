'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef } from 'ag-grid-community'
import type { Borrower } from '@/types/borrower'
import { BorrowerDetailsModal } from './BorrowerDetailsModal'

interface BorrowerListProps {
  borrowers: Borrower[]
}

export function BorrowerList({ borrowers }: BorrowerListProps) {
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      pinned: 'left',
    },
    {
      field: 'businessType',
      headerName: 'Type',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant="outline">
          {params.value || 'CORPORATE'}
        </Badge>
      ),
    },
    {
      field: 'industry',
      headerName: 'Industry',
      width: 150,
    },
    {
      field: 'taxId',
      headerName: 'Tax ID',
      width: 130,
    },
    {
      field: 'jurisdiction',
      headerName: 'Jurisdiction',
      width: 130,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'ACTIVE' ? 'default' : 'secondary'}>
          {params.value || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      field: 'riskRating',
      headerName: 'Risk Rating',
      width: 120,
      cellRenderer: (params: any) => params.value ? (
        <Badge variant={
          params.value.includes('HIGH') ? 'destructive' :
          params.value.includes('MEDIUM') ? 'warning' : 'default'
        }>
          {params.value}
        </Badge>
      ) : '-',
    },
    {
      field: 'creditRating',
      headerName: 'Credit Rating',
      width: 120,
    },
    {
      field: 'kycStatus',
      headerName: 'KYC',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'COMPLETED' ? 'default' : 'secondary'}>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'amlStatus',
      headerName: 'AML',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={
          params.value === 'CLEARED' ? 'default' :
          params.value === 'FLAGGED' ? 'destructive' : 'secondary'
        }>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'sanctionsStatus',
      headerName: 'Sanctions',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={
          params.value === 'CLEARED' ? 'default' :
          params.value === 'FLAGGED' ? 'destructive' : 'secondary'
        }>
          {params.value}
        </Badge>
      ),
    },
  ], [])

  const handleRowClick = (data: Borrower) => {
    setSelectedBorrower(data)
    setDetailsOpen(true)
  }

  return (
    <>
      <DataGrid
        rowData={borrowers}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          floatingFilter: true,
        }}
        onRowClick={handleRowClick}
        domLayout="autoHeight"
      />

      <BorrowerDetailsModal
        borrower={selectedBorrower}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  )
} 