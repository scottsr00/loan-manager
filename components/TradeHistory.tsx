'use client'

import { useState, useMemo } from 'react'
import { useTrades } from '@/hooks/useTrades'
import { Button } from "@/components/ui/button"
import { TradeDetailsModal } from './TradeDetailsModal'
import { BookTradeModal } from './BookTradeModal'
import { DataGrid } from './ui/data-grid'
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { TradeHistoryItem } from '@/server/types'
import type { ColDef } from 'ag-grid-community'

export function TradeHistory() {
  const { trades, isLoading, isError, book } = useTrades()
  const [selectedTrade, setSelectedTrade] = useState<TradeHistoryItem | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isBookTradeOpen, setIsBookTradeOpen] = useState(false)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'facility.creditAgreement.agreementName',
      headerName: 'Deal Name',
      flex: 1,
      valueGetter: (params) => {
        return params.data?.facility?.creditAgreement?.agreementName || 'N/A'
      }
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      valueFormatter: params => formatCurrency(params.value),
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'price',
      headerName: 'Price',
      flex: 1,
      valueFormatter: params => `${params.value.toFixed(2)}%`,
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'counterparty.legalName',
      headerName: 'Counterparty',
      flex: 1,
      valueGetter: (params) => {
        return params.data?.counterparty?.legalName || 'N/A'
      }
    },
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      flex: 1,
      valueFormatter: params => new Date(params.value).toLocaleDateString(),
      filter: 'agDateColumnFilter',
    },
    {
      field: 'settlementDate',
      headerName: 'Settlement Date',
      flex: 1,
      valueFormatter: params => new Date(params.value).toLocaleDateString(),
      filter: 'agDateColumnFilter',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      cellRenderer: params => (
        <Badge variant={params.value === 'SETTLED' ? 'success' : 'warning'}>
          {params.value}
        </Badge>
      ),
    },
  ], [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center p-8 text-destructive">
        Error loading trades. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Trade History</h2>
        <Button onClick={() => setIsBookTradeOpen(true)}>Book Trade</Button>
      </div>

      <DataGrid
        rowData={trades || []}
        columnDefs={columnDefs}
        onGridReady={params => {
          params.api.sizeColumnsToFit()
        }}
        onRowClick={(data) => {
          console.log('Row clicked, data:', data)
          setSelectedTrade(data)
          setIsDetailsOpen(true)
        }}
      />

      <TradeDetailsModal
        trade={selectedTrade}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <BookTradeModal
        open={isBookTradeOpen}
        onOpenChange={setIsBookTradeOpen}
        onTradeBooked={book}
      />
    </div>
  )
}