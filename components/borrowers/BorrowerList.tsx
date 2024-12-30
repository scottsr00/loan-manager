'use client'

import '@/lib/ag-grid-init'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef } from 'ag-grid-community'
import { BorrowerDetailsModal } from './BorrowerDetailsModal'
import { BorrowerModal } from './BorrowerModal'
import type { Borrower } from '@/types/borrower'

interface BorrowerListProps {
  borrowers: Borrower[]
  onUpdate?: () => void
}

export function BorrowerList({ borrowers, onUpdate }: BorrowerListProps) {
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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
      field: 'countryOfIncorporation',
      headerName: 'Country',
      width: 150,
    },
    {
      field: 'industrySegment',
      headerName: 'Industry',
      width: 150,
    },
    {
      field: 'businessType',
      headerName: 'Business Type',
      width: 150,
    },
    {
      field: 'creditRating',
      headerName: 'Rating',
      width: 120,
      valueFormatter: (params) => {
        if (!params.value) return '-'
        return `${params.value}${params.data.ratingAgency ? ` (${params.data.ratingAgency})` : ''}`
      }
    },
    {
      field: 'onboardingStatus',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'COMPLETED' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'kycStatus',
      headerName: 'KYC',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'APPROVED' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      ),
    }
  ], [])

  const handleModalClose = () => {
    setIsEditModalOpen(false)
    setSelectedBorrower(null)
    onUpdate?.()
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
        onRowClick={(params) => {
          setSelectedBorrower(params.data)
          setDetailsOpen(true)
        }}
      />
      <BorrowerDetailsModal
        borrower={selectedBorrower}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={() => {
          setDetailsOpen(false)
          setIsEditModalOpen(true)
        }}
      />
      <BorrowerModal
        borrower={selectedBorrower}
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onUpdate={onUpdate || (() => {})}
      />
    </div>
  )
} 