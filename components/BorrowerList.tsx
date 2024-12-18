import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef } from 'ag-grid-community'
import { BorrowerDetailsModal } from './BorrowerDetailsModal'

interface BorrowerListProps {
  borrowers: any[]
}

export function BorrowerList({ borrowers }: BorrowerListProps) {
  const [selectedBorrower, setSelectedBorrower] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
    },
    {
      field: 'taxId',
      headerName: 'Tax ID',
      width: 150,
    },
    {
      field: 'jurisdiction',
      headerName: 'Jurisdiction',
      width: 150,
    },
    {
      field: 'industry',
      headerName: 'Industry',
      width: 150,
    },
    {
      field: 'onboardingStatus',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'COMPLETED' ? 'success' : 'secondary'}>
          {params.value || '-'}
        </Badge>
      ),
    },
  ], [])

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
        onRowClicked={(params) => {
          setSelectedBorrower(params.data)
          setDetailsOpen(true)
        }}
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