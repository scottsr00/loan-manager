'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type ValueGetterParams, type ValueFormatterParams, type ICellRendererParams } from 'ag-grid-community'
import { formatCurrency } from '@/lib/utils'
import { getPositionHistory } from '@/server/actions/position/positionHistory'
import type { LenderPositionHistory } from '@/server/types/position'
import '@/lib/ag-grid-init'

interface Activity {
  id: string
  type: 'SERVICING' | 'TRADE'
  date: Date
  amount: number
  status: string
}

interface PositionHistoryProps {
  facilityId?: string
  selectedActivity?: Activity | null
  lenderId?: string
  startDate?: Date
  endDate?: Date
}

export function PositionHistory({ facilityId, selectedActivity, lenderId, startDate, endDate }: PositionHistoryProps) {
  const [history, setHistory] = useState<LenderPositionHistory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true)
        if (!facilityId) return

        const data = await getPositionHistory({ 
          facilityId, 
          lenderId, 
          startDate: selectedActivity ? new Date(selectedActivity.date) : startDate,
          endDate: selectedActivity ? new Date(selectedActivity.date) : endDate,
          activityId: selectedActivity?.id,
          activityType: selectedActivity?.type
        })
        setHistory(data)
      } catch (err) {
        console.error('Error loading position history:', err)
        setError('Failed to load position history')
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [facilityId, lenderId, startDate, endDate, selectedActivity])

  const getChangeTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success'> = {
      'PAYDOWN': 'success',
      'ACCRUAL': 'secondary',
      'TRADE': 'default'
    }
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>
  }

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'lender.legalName',
      headerName: 'Lender',
      flex: 1,
      valueGetter: (params: ValueGetterParams) => params.data?.lender?.legalName || 'N/A'
    },
    {
      field: 'changeDateTime',
      headerName: 'Last Updated',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => format(new Date(params.value), 'PPP'),
      filter: 'agDateColumnFilter'
    },
    {
      field: 'changeType',
      headerName: 'Last Change',
      flex: 1,
      cellRenderer: (params: ICellRendererParams) => getChangeTypeBadge(params.value)
    },
    {
      field: 'newOutstandingAmount',
      headerName: 'Outstanding Amount',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'newAccruedInterest',
      headerName: 'Accrued Interest',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'changeAmount',
      headerName: 'Last Change Amount',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'notes',
      headerName: 'Notes',
      flex: 2
    }
  ], [])

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <div className="h-[600px] w-full">
      <DataGrid
        rowData={history}
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