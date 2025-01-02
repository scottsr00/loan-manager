'use client'

import { useState, useMemo } from 'react'
import { type TradeWithRelations } from '@/server/types/trade'
import { NewTradeModal } from './NewTradeModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef } from 'ag-grid-community'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { EyeIcon } from 'lucide-react'
import { TradeDetailsModal } from './TradeDetailsModal'
import '@/lib/ag-grid-init'

interface TradeHistoryProps {
  trades: TradeWithRelations[]
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>
    case 'CONFIRMED':
      return <Badge variant="default">Confirmed</Badge>
    case 'SETTLED':
      return <Badge variant="success">Settled</Badge>
    case 'CLOSED':
      return <Badge variant="outline">Closed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const [selectedTrade, setSelectedTrade] = useState<TradeWithRelations | null>(null)

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      valueFormatter: (params) => format(new Date(params.value), 'PP')
    },
    {
      field: 'facility.facilityName',
      headerName: 'Facility'
    },
    {
      field: 'sellerCounterparty.entity.legalName',
      headerName: 'Seller'
    },
    {
      field: 'buyerCounterparty.entity.legalName',
      headerName: 'Buyer'
    },
    {
      field: 'parAmount',
      headerName: 'Par Amount',
      valueFormatter: (params) => formatCurrency(params.value)
    },
    {
      field: 'price',
      headerName: 'Price',
      valueFormatter: (params) => `${params.value}%`
    },
    {
      field: 'settlementAmount',
      headerName: 'Settlement Amount',
      valueFormatter: (params) => formatCurrency(params.value)
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: (params: any) => getStatusBadge(params.value)
    },
    {
      headerName: 'Actions',
      width: 100,
      cellRenderer: (params: any) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedTrade(params.data)
          }}
          title="View Details"
        >
          <EyeIcon className="h-4 w-4" />
        </Button>
      )
    }
  ], [])

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
        <div className="h-[600px] w-full">
          <DataGrid
            rowData={trades}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              floatingFilter: true
            }}
            onRowClick={(params) => setSelectedTrade(params.data)}
          />
        </div>
      </CardContent>

      {selectedTrade && (
        <TradeDetailsModal
          trade={selectedTrade}
          open={!!selectedTrade}
          onOpenChange={(open) => !open && setSelectedTrade(null)}
          onSuccess={() => {
            window.location.reload()
          }}
        />
      )}
    </Card>
  )
}