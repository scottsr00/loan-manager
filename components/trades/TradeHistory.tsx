'use client'

import { type TradeWithRelations } from '@/server/types/trade'
import { DataGrid } from '@/components/ui/data-grid'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import '@/lib/ag-grid-init'
import { NewTradeModal } from './NewTradeModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TradeHistoryProps {
  trades: TradeWithRelations[]
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const columnDefs: ColDef[] = [
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      valueFormatter: params => format(new Date(params.value), 'PP')
    },
    {
      field: 'sellerCounterparty.entity.legalName',
      headerName: 'Seller',
      valueGetter: params => params.data.sellerCounterparty.entity.legalName
    },
    {
      field: 'buyerCounterparty.entity.legalName',
      headerName: 'Buyer',
      valueGetter: params => params.data.buyerCounterparty.entity.legalName
    },
    {
      field: 'parAmount',
      headerName: 'Par Amount',
      valueFormatter: params => formatCurrency(params.value)
    },
    {
      field: 'price',
      headerName: 'Price',
      valueFormatter: params => `${params.value}%`
    },
    {
      field: 'settlementAmount',
      headerName: 'Settlement Amount',
      valueFormatter: params => formatCurrency(params.value)
    },
    {
      field: 'settlementDate',
      headerName: 'Settlement Date',
      valueFormatter: params => format(new Date(params.value), 'PP')
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: (params: ICellRendererParams) => (
        <Badge variant={params.value === 'SETTLED' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      )
    }
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Trade History</CardTitle>
        <NewTradeModal 
          onSuccess={() => {
            window.location.reload()
          }}
        />
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <DataGrid
            rowData={trades}
            columnDefs={columnDefs}
            onGridReady={params => {
              params.api.sizeColumnsToFit()
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}