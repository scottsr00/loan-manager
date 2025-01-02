'use client'

import { type Trade } from '@prisma/client'
import { DataGrid } from '@/components/ui/data-grid'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'

interface TradeHistoryProps {
  trades: (Trade & {
    sellerCounterparty: {
      entity: {
        id: string
        legalName: string
      }
    }
    buyerCounterparty: {
      entity: {
        id: string
        legalName: string
      }
    }
  })[]
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const columnDefs: ColDef[] = [
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      valueFormatter: params => format(new Date(params.value), 'PP')
    },
    {
      field: 'seller',
      headerName: 'Seller',
      valueGetter: params => params.data.sellerCounterparty.entity.legalName
    },
    {
      field: 'buyer',
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
    <div className="h-[400px] w-full">
      <DataGrid
        rowData={trades}
        columnDefs={columnDefs}
        onGridReady={params => {
          params.api.sizeColumnsToFit()
        }}
      />
    </div>
  )
}