'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type ICellRendererParams } from 'ag-grid-community'
import { BorrowerModal } from './BorrowerModal'
import { Plus } from 'lucide-react'
import type { Borrower } from '@/types/borrower'

interface BorrowerListProps {
  borrowers: Borrower[]
}

export function BorrowerList({ borrowers }: BorrowerListProps) {
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      field: 'businessType',
      headerName: 'Business Type',
      width: 150,
    },
    {
      field: 'creditRating',
      headerName: 'Credit Rating',
      width: 120,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A'
        return params.data.ratingAgency ? `${params.value} (${params.data.ratingAgency})` : params.value
      },
    },
    {
      field: 'riskRating',
      headerName: 'Risk Rating',
      width: 120,
    },
    {
      field: 'onboardingStatus',
      headerName: 'Onboarding',
      width: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <Badge variant={params.value === 'COMPLETED' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'kycStatus',
      headerName: 'KYC',
      width: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <Badge variant={params.value === 'COMPLETED' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'entity.contacts',
      headerName: 'Primary Contact',
      width: 200,
      valueGetter: (params) => {
        const primaryContact = params.data.entity.contacts[0]
        if (!primaryContact) return 'No primary contact'
        const contactInfo = `${primaryContact.firstName} ${primaryContact.lastName}`
        return primaryContact.title ? `${contactInfo}\n${primaryContact.title}` : contactInfo
      },
    },
    {
      field: 'entity.addresses',
      headerName: 'Location',
      width: 200,
      valueGetter: (params) => {
        const primaryAddress = params.data.entity.addresses[0]
        if (!primaryAddress) return 'No primary address'
        return primaryAddress.state 
          ? `${primaryAddress.city}, ${primaryAddress.state}, ${primaryAddress.country}`
          : `${primaryAddress.city}, ${primaryAddress.country}`
      },
    },
  ], [])

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedBorrower(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelectedBorrower(null)
            setIsModalOpen(true)
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
        onRowClick={(params) => {
          setSelectedBorrower(params.data)
          setIsModalOpen(true)
        }}
      />

      <BorrowerModal
        open={isModalOpen}
        onClose={handleModalClose}
        borrower={selectedBorrower}
      />
    </div>
  )
} 