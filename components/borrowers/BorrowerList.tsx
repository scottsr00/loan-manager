'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type ICellRendererParams, type RowClickedEvent } from 'ag-grid-community'
import { BorrowerModal } from './BorrowerModal'
import { BorrowerDetailsModal } from '@/components/borrowers/BorrowerDetailsModal'
import { Plus } from 'lucide-react'
import type { Borrower } from '@/types/borrower'

interface BorrowerListProps {
  borrowers: Borrower[]
}

export function BorrowerList({ borrowers }: BorrowerListProps) {
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'entity.legalName',
      headerName: 'Legal Name',
      width: 250,
      valueFormatter: (params) => {
        const dba = params.data.entity.dba
        return dba ? `${params.value} (DBA: ${dba})` : params.value
      },
    },
    {
      field: 'entity.taxId',
      headerName: 'Tax ID',
      width: 150,
    },
    {
      field: 'entity.countryOfIncorporation',
      headerName: 'Country of Incorporation',
      width: 150,
    },
    {
      field: 'industrySegment',
      headerName: 'Industry',
      width: 150,
    },
    {
      field: 'onboardingStatus',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <Badge variant={params.value === 'COMPLETED' ? 'success' : 'secondary'}>
          {params.value || '-'}
        </Badge>
      ),
    },
  ], [])

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false)
    setSelectedBorrower(null)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelectedBorrower(null)
            setIsEditModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Borrower
        </Button>
      </div>

      <DataGrid
        rowData={borrowers}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          floatingFilter: true,
        }}
        onRowClick={(params: RowClickedEvent) => {
          if (params.data) {
            setSelectedBorrower(params.data)
            setIsDetailsModalOpen(true)
          }
        }}
      />

      <BorrowerDetailsModal
        borrower={selectedBorrower}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        onEdit={() => {
          setIsDetailsModalOpen(false)
          setIsEditModalOpen(true)
        }}
      />

      <BorrowerModal
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        borrower={selectedBorrower}
      />
    </div>
  )
} 