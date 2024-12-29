'use client'

import '@/lib/ag-grid-init'
import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type ICellRendererParams, type GridOptions } from 'ag-grid-community'
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
    
    // Toggle expanded state for the clicked agreement
    setExpandedAgreement(prevExpanded => 
      prevExpanded?.id === params.data.id ? null : params.data
    );
  }

  const gridOptions = useMemo<GridOptions>(() => ({
    getRowClass: (params: { data: CreditAgreementWithRelations }) => {
      if (!params.data) return '';
      return params.data.id === expandedAgreement?.id ? 'bg-accent/50' : '';
    }
  }), [expandedAgreement?.id])

  return (
    <div className="space-y-4">
      <div className={expandedAgreement ? 'opacity-90' : ''}>
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
          gridOptions={gridOptions}
        />
      </div>

      {expandedAgreement && (
        <div className="mt-4 border rounded-lg p-4 bg-background shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Facilities for {expandedAgreement.agreementNumber}
            </h3>
            <Badge variant="outline">
              {expandedAgreement.facilities.length} {expandedAgreement.facilities.length === 1 ? 'Facility' : 'Facilities'}
            </Badge>
          </div>
          <DataGrid
            rowData={expandedAgreement.facilities || []}
            columnDefs={facilityColumnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            className="min-h-[200px]"
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