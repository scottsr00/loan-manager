import '@/lib/ag-grid-init'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef } from 'ag-grid-community'
import { BorrowerDetailsModal } from './BorrowerDetailsModal'
import { BorrowerModal } from './borrowers/BorrowerModal'

interface BorrowerListProps {
  borrowers: any[]
  onUpdate?: () => void
}

export function BorrowerList({ borrowers, onUpdate }: BorrowerListProps) {
  const [selectedBorrower, setSelectedBorrower] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'entity.legalName',
      headerName: 'Legal Name',
      width: 200,
    },
    {
      field: 'entity.taxId',
      headerName: 'Tax ID',
      width: 150,
    },
    {
      field: 'entity.countryOfIncorporation',
      headerName: 'Country',
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
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'COMPLETED' ? 'success' : 'secondary'}>
          {params.value || '-'}
        </Badge>
      ),
    },
    {
      field: 'kycStatus',
      headerName: 'KYC Status',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'COMPLETED' ? 'success' : 'secondary'}>
          {params.value || '-'}
        </Badge>
      ),
    },
  ], [])

  const handleModalClose = () => {
    setIsEditModalOpen(false)
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
      />
      <BorrowerModal
        open={isEditModalOpen}
        onClose={handleModalClose}
        borrower={selectedBorrower}
      />
    </div>
  )
} 