'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PositionHistory } from './PositionHistory'
import { DataGrid } from '@/components/ui/data-grid'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { type ColDef, type ValueFormatterParams, type RowClickedEvent } from 'ag-grid-community'
import { useMemo, useState } from 'react'

interface Activity {
  id: string
  type: 'SERVICING' | 'TRADE'
  date: Date
  amount: number
  status: string
}

interface PositionHistoryModalProps {
  facilityId?: string
  facility?: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PositionHistoryModal({ facilityId, facility, open, onOpenChange }: PositionHistoryModalProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const activityColumnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'date',
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

  const gridOptions = useMemo(() => ({
    rowSelection: 'single' as const
  }), [])

  const activities = useMemo(() => {
    if (!facility) return []
    console.log('Facility data:', facility)
    const combinedActivities = [
      ...(facility.servicingActivities || []).map((activity: any) => ({
        ...activity,
        type: 'SERVICING' as const,
        date: activity.dueDate,
        id: activity.id
      })),
      ...(facility.trades || []).map((trade: any) => ({
        ...trade,
        type: 'TRADE' as const,
        date: trade.tradeDate,
        id: trade.id,
        amount: trade.parAmount
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    console.log('Combined activities:', combinedActivities)
    return combinedActivities
  }, [facility])

  const handleRowClick = (event: RowClickedEvent) => {
    setSelectedActivity(event.data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Position History - {facility?.facilityName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <Card className="flex-1">
            <CardHeader className="py-2">
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-[250px]">
                <DataGrid
                  rowData={activities}
                  columnDefs={activityColumnDefs}
                  defaultColDef={{
                    sortable: true,
                    filter: true
                  }}
                  gridOptions={gridOptions}
                  onRowClick={handleRowClick}
                  className="h-full w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="py-2">
              <CardTitle>Position History</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-[250px]">
                <PositionHistory 
                  facilityId={facilityId} 
                  selectedActivity={selectedActivity}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 