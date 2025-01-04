'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type ValueGetterParams, type ValueFormatterParams, type ICellRendererParams } from 'ag-grid-community'
import { formatCurrency } from '@/lib/utils'
import { getFacilityPositionHistory } from '@/server/actions/facility/facilityPositionHistory'
import type { FacilityPositionHistoryView } from '@/server/types/facility-position-history'
import '@/lib/ag-grid-init'

interface Activity {
  id: string;
  type: 'SERVICING' | 'TRADE';
  activityType: string;
  dueDate: Date;
  description: string | null;
  amount: number;
  status: string;
  completedAt: Date | null;
  completedBy: string | null;
}

interface PositionHistoryProps {
  facilityId?: string
  selectedActivity?: Activity | null
  lenderId?: string
  startDate?: Date
  endDate?: Date
}

export function PositionHistory({ facilityId, selectedActivity, lenderId, startDate, endDate }: PositionHistoryProps) {
  const [history, setHistory] = useState<FacilityPositionHistoryView[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true)
        if (!facilityId) return

        const data = await getFacilityPositionHistory({ 
          facilityId, 
          lenderId,
          ...(selectedActivity 
            ? {
                activityId: selectedActivity.id,
                activityType: selectedActivity.type as 'SERVICING' | 'TRADE'
              }
            : {
                startDate,
                endDate
              }
          )
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
      'TRADE': 'default',
      'DRAWDOWN': 'default'
    }
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>
  }

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'lenderName',
      headerName: 'Lender',
      flex: 1
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
      field: 'previousDrawnAmount',
      headerName: 'Previous Drawn',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'newDrawnAmount',
      headerName: 'New Drawn',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'previousCommitmentAmount',
      headerName: 'Previous Commitment',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'newCommitmentAmount',
      headerName: 'New Commitment',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'previousShare',
      headerName: 'Previous Share %',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => `${params.value}%`,
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'newShare',
      headerName: 'New Share %',
      flex: 1,
      valueFormatter: (params: ValueFormatterParams) => `${params.value}%`,
      filter: 'agNumberColumnFilter'
    },
    {
      field: 'changeAmount',
      headerName: 'Change Amount',
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