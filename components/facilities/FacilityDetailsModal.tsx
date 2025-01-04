'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { getFacility } from '@/server/actions/facility/getFacility'
import { PositionHistory } from '@/components/positions/PositionHistory'
import { DataGrid } from '@/components/ui/data-grid'
import { type ColDef, type ValueFormatterParams, type ICellRendererParams } from 'ag-grid-community'
import '@/lib/ag-grid-init'
import type { FacilityWithRelations } from '@/server/types/facility'

interface Activity {
  id: string
  type: 'SERVICING' | 'TRADE'
  date: Date
  amount: number
  status: string
  activityType?: string
}

interface FacilityDetailsModalProps {
  facilityId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FacilityDetailsModal({
  facilityId,
  open,
  onOpenChange,
}: FacilityDetailsModalProps) {
  const [facility, setFacility] = useState<FacilityWithRelations | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFacility = async () => {
      if (!facilityId) return
      try {
        const data = await getFacility(facilityId)
        if (!data) {
          setError('Facility not found')
          return
        }
        setFacility(data)
        
        // Combine servicing activities and trades into a single timeline
        const allActivities = [
          ...(data.servicingActivities || []).map((activity) => ({
            id: activity.id,
            type: 'SERVICING' as const,
            date: activity.dueDate,
            amount: activity.amount,
            status: activity.status,
            activityType: activity.activityType
          })),
          ...(data.trades || []).map((trade) => ({
            id: trade.id,
            type: 'TRADE' as const,
            date: trade.tradeDate,
            amount: trade.parAmount,
            status: trade.status
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        setActivities(allActivities)
      } catch (err) {
        console.error('Error loading facility:', err)
        setError('Failed to load facility details')
      }
    }

    loadFacility()
  }, [facilityId])

  const activityColumnDefs: ColDef[] = [
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
      cellRenderer: (params: ICellRendererParams) => (
        <Badge variant={params.value === 'TRADE' ? 'default' : 'secondary'}>
          {params.value === 'SERVICING' ? params.data.activityType : params.value}
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
      cellRenderer: (params: ICellRendererParams) => (
        <Badge variant={params.value === 'COMPLETED' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      )
    }
  ]

  if (!facilityId || !open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Facility Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            {facility && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Facility Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-semibold">Name:</span> {facility.facilityName}
                    </div>
                    <div>
                      <span className="font-semibold">Type:</span> {facility.facilityType}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{' '}
                      <Badge variant={facility.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {facility.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-semibold">Commitment:</span>{' '}
                      {formatCurrency(facility.commitmentAmount)}
                    </div>
                    <div>
                      <span className="font-semibold">Available:</span>{' '}
                      {formatCurrency(facility.availableAmount)}
                    </div>
                    <div>
                      <span className="font-semibold">Currency:</span> {facility.currency}
                    </div>
                    <div>
                      <span className="font-semibold">Start Date:</span>{' '}
                      {format(new Date(facility.startDate), 'PP')}
                    </div>
                    <div>
                      <span className="font-semibold">Maturity Date:</span>{' '}
                      {format(new Date(facility.maturityDate), 'PP')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Credit Agreement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {facility.creditAgreement && (
                      <>
                        <div>
                          <span className="font-semibold">Agreement Number:</span>{' '}
                          {facility.creditAgreement.agreementNumber}
                        </div>
                        <div>
                          <span className="font-semibold">Borrower:</span>{' '}
                          {facility.creditAgreement.borrower?.legalName}
                          {facility.creditAgreement.borrower?.dba && (
                            <span className="text-muted-foreground"> ({facility.creditAgreement.borrower.dba})</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">Lender:</span>{' '}
                          {facility.creditAgreement.lender?.legalName}
                          {facility.creditAgreement.lender?.dba && (
                            <span className="text-muted-foreground"> ({facility.creditAgreement.lender.dba})</span>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="grid grid-cols-2 gap-4">
              {/* Activity History */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <DataGrid
                      rowData={activities}
                      columnDefs={activityColumnDefs}
                      onRowClick={params => setSelectedActivity(params.data)}
                      defaultColDef={{
                        sortable: true,
                        filter: true
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Position History */}
              <Card>
                <CardHeader>
                  <CardTitle>Position Snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {selectedActivity && (
                      <PositionHistory
                        facilityId={facilityId}
                        endDate={new Date(selectedActivity.date)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 