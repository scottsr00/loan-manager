'use client'

import { useState, useEffect, useMemo } from 'react'
import { DataGrid } from '@/components/ui/data-grid'
import { getTransactions } from '@/server/actions/transaction/getTransactions'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ColDef } from 'ag-grid-community'
import type { TransactionHistory as TransactionHistoryType } from '@/server/types/transaction'

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionHistoryType[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadTransactions = async () => {
    try {
      const data = await getTransactions()
      setTransactions(data)
    } catch (err) {
      console.error('Error loading transactions:', err)
      setError('Failed to load transaction history')
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
      'PAYDOWN': 'success',
      'RATE_RESET': 'secondary',
      'TRADE_SETTLEMENT': 'default',
      'LOAN_DRAWDOWN': 'secondary',
      'COMMITMENT_CHANGE': 'default',
      'FACILITY_TERMINATION': 'destructive',
      'CREDIT_AGREEMENT_AMENDMENT': 'secondary',
      'OTHER': 'default'
    }
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>
  }

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      cellRenderer: (params: { value: string }) => getTypeBadge(params.value)
    },
    {
      field: 'creditAgreement.agreementNumber',
      headerName: 'Agreement',
      flex: 1,
      valueGetter: params => params.data?.creditAgreement?.agreementNumber || 'N/A'
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      valueFormatter: params => params.value ? formatCurrency(params.value) : '-',
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'currency',
      headerName: 'Currency',
      flex: 1
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2
    },
    {
      field: 'effectiveDate',
      headerName: 'Effective Date',
      flex: 1,
      valueFormatter: params => {
        if (!params.value) return ''
        try {
          return format(new Date(params.value), 'PPP')
        } catch (error) {
          console.error('Error formatting date:', error)
          return 'Invalid date'
        }
      },
      filter: 'agDateColumnFilter'
    },
    {
      field: 'processedBy',
      headerName: 'Processed By',
      flex: 1
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      flex: 1,
      valueFormatter: params => {
        if (!params.value) return ''
        try {
          return format(new Date(params.value), 'PPP')
        } catch (error) {
          console.error('Error formatting date:', error)
          return 'Invalid date'
        }
      },
      filter: 'agDateColumnFilter'
    }
  ], [])

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <DataGrid
        rowData={transactions}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          floatingFilter: true
        }}
      />
    </div>
  )
} 