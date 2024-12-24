'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type ICellRendererParams } from 'ag-grid-community'
import { CreditAgreementDetailsModal } from './CreditAgreementDetailsModal'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { type CreditAgreementWithRelations } from '@/server/types/credit-agreement'

interface CreditAgreementListProps {
  creditAgreements: CreditAgreementWithRelations[]
  onUpdate?: () => void
}

export function CreditAgreementList({ creditAgreements, onUpdate }: CreditAgreementListProps) {
  const [selectedCreditAgreement, setSelectedCreditAgreement] = useState<CreditAgreementWithRelations | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [expandedAgreement, setExpandedAgreement] = useState<CreditAgreementWithRelations | null>(null)

  const facilityColumnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'facilityName',
      headerName: 'Facility Name',
      width: 200,
    },
    {
      field: 'facilityType',
      headerName: 'Type',
      width: 150,
    },
    {
      field: 'commitmentAmount',
      headerName: 'Commitment',
      width: 150,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'availableAmount',
      headerName: 'Available',
      width: 150,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 100,
    },
    {
      field: 'interestType',
      headerName: 'Interest Type',
      width: 150,
    },
    {
      field: 'baseRate',
      headerName: 'Base Rate',
      width: 120,
    },
    {
      field: 'margin',
      headerName: 'Margin (%)',
      width: 120,
      valueFormatter: (params) => params.value ? `${params.value}%` : '',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <Badge variant={params.value === 'ACTIVE' ? 'success' : 'default'}>
          {params.value}
        </Badge>
      ),
    },
  ], [])

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'agreementNumber',
      headerName: 'Agreement Number',
      width: 200,
    },
    {
      field: 'borrower.legalName',
      headerName: 'Borrower',
      width: 200,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 100,
    },
    {
      field: 'interestRate',
      headerName: 'Interest Rate',
      width: 120,
      valueFormatter: (params) => `${params.value}%`,
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 150,
      valueFormatter: (params) => format(new Date(params.value), 'MMM d, yyyy'),
    },
    {
      field: 'maturityDate',
      headerName: 'Maturity Date',
      width: 150,
      valueFormatter: (params) => format(new Date(params.value), 'MMM d, yyyy'),
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
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      cellRenderer: (params: ICellRendererParams) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedCreditAgreement(params.data)
            setDetailsOpen(true)
          }}
        >
          Details
        </Button>
      ),
    },
  ], [])

  const handleRowClick = (params: { data: CreditAgreementWithRelations }) => {
    if (!params.data) return;
    
    if (expandedAgreement?.id === params.data.id) {
      setExpandedAgreement(null);
    } else {
      setExpandedAgreement(params.data);
      setDetailsOpen(true);
    }
  }

  return (
    <div className="space-y-4">
      <DataGrid
        rowData={creditAgreements}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          floatingFilter: true,
        }}
        onRowClick={handleRowClick}
      />

      {expandedAgreement && (
        <div className="mt-4 border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            Facilities for {expandedAgreement.agreementNumber}
          </h3>
          <DataGrid
            rowData={expandedAgreement.facilities || []}
            columnDefs={facilityColumnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
          />
        </div>
      )}

      <CreditAgreementDetailsModal
        creditAgreement={selectedCreditAgreement}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onUpdate={onUpdate}
      />
    </div>
  )
} 