'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef } from 'ag-grid-community'
import { CreditAgreementDetailsModal } from './CreditAgreementDetailsModal'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

interface CreditAgreementListProps {
  creditAgreements: any[]
}

export function CreditAgreementList({ creditAgreements }: CreditAgreementListProps) {
  const [selectedCreditAgreement, setSelectedCreditAgreement] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'agreementName',
      headerName: 'Agreement Name',
      width: 200,
    },
    {
      field: 'agreementNumber',
      headerName: 'Agreement Number',
      width: 150,
    },
    {
      field: 'borrower.name',
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
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'ACTIVE' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      ),
    },
  ], [])

  return (
    <>
      <DataGrid
        rowData={creditAgreements}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          floatingFilter: true,
        }}
        onRowClick={(data) => {
          setSelectedCreditAgreement(data)
          setDetailsOpen(true)
        }}
        domLayout="autoHeight"
      />

      <CreditAgreementDetailsModal
        creditAgreement={selectedCreditAgreement}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  )
} 