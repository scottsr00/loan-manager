'use client'

import '@/lib/ag-grid-init'
import { useState, useMemo } from 'react'
import { useTrades } from '@/hooks/useTrades'
import { Button } from "@/components/ui/button"
import { TradeDetailsModal } from './TradeDetailsModal'
import { NewTradeModal } from './NewTradeModal'
import { DataGrid } from '@/components/ui/data-grid'
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { type TradeWithRelations, TradeStatus } from '@/server/types/trade'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'

export function TradeHistory() {
  const { trades, isLoading, isError, mutate } = useTrades()
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isNewTradeOpen, setIsNewTradeOpen] = useState(false)

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
      cellRenderer: (params: { value: keyof typeof TradeStatus }) => {
        const status = String(params.value)
        return (
          <Badge variant={status === 'CLOSED' ? 'success' : 'secondary'}>
            {status}
          </Badge>
        )
      },
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
        <NewTradeModal
          open={isNewTradeOpen}
          onOpenChange={setIsNewTradeOpen}
          onSuccess={() => {
            setIsNewTradeOpen(false)
            mutate()
          }}
          trigger={<Button>New Trade</Button>}
        />
      </div>

      <DataGrid
        rowData={trades || []}
        columnDefs={columnDefs}
        onGridReady={params => {
          params.api.sizeColumnsToFit()
        }}
        onRowClick={(event: RowClickedEvent<TradeWithRelations>) => {
          if (event.data) {
            setSelectedTrade(event.data.id)
            setIsDetailsOpen(true)
          }
        }}
      />

      <TradeDetailsModal
        tradeId={selectedTrade || ''}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  )
}