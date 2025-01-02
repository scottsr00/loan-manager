'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PositionHistory } from './PositionHistory'
import { DataGrid } from '@/components/ui/data-grid'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { type ColDef, type ValueFormatterParams } from 'ag-grid-community'
import { useMemo } from 'react'

interface PositionHistoryModalProps {
  facilityId?: string
  facility?: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PositionHistoryModal({ facilityId, facility, open, onOpenChange }: PositionHistoryModalProps) {
  const activityColumnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'dueDate',
      headerName: 'Date',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => format(new Date(params.value), 'PPP')
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      cellRenderer: (params: { value: string }) => (
        <Badge variant={params.value === 'TRADE' ? 'default' : 'secondary'}>
          {params.value}
        </Badge>
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value)
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      cellRenderer: (params: { value: string }) => (
        <Badge variant={params.value === 'COMPLETED' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      )
    }
  ], [])

  const activities = useMemo(() => {
    if (!facility) return []
    return [
      ...(facility.servicingActivities || []).map((activity: any) => ({
        ...activity,
        type: 'SERVICING',
        date: activity.dueDate
      })),
      ...(facility.trades || []).map((trade: any) => ({
        ...trade,
        type: 'TRADE',
        date: trade.tradeDate
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [facility])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Position History - {facility?.facilityName}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <DataGrid
                  rowData={activities}
                  columnDefs={activityColumnDefs}
                  defaultColDef={{
                    sortable: true,
                    filter: true
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Position History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <PositionHistory facilityId={facilityId} />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 