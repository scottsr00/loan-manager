'use client'

import { useState, useEffect, useMemo } from 'react'
import { type ColDef } from 'ag-grid-community'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataGrid } from '@/components/ui/data-grid'
import { getFacilities } from '@/server/actions/loan/getFacilities'
import { resetFacility } from '@/server/actions/facility/resetFacility'
import { formatCurrency } from '@/lib/utils'
import { FacilityDetailsModal } from './FacilityDetailsModal'
import { PositionHistoryModal } from '@/components/positions/PositionHistoryModal'
import { ScrollText } from 'lucide-react'
import '@/lib/ag-grid-init'
import type { FacilityWithRelations } from '@/server/types/facility'

export function FacilityList() {
  const [facilities, setFacilities] = useState<FacilityWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<FacilityWithRelations | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const loadFacilities = async () => {
    try {
      setIsLoading(true)
      const data = await getFacilities()
      console.log('Facilities:', JSON.stringify(data, null, 2))
      setFacilities(data)
    } catch (err) {
      console.error('Error loading facilities:', err)
      setError('Failed to load facilities')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFacilities()
  }, [])

  const handleReset = async (facilityId: string) => {
    try {
      await resetFacility(facilityId)
      await loadFacilities() // Reload the facilities after reset
    } catch (err) {
      console.error('Error resetting facility:', err)
      setError('Failed to reset facility')
    }
  }

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'facilityName',
      headerName: 'Facility Name',
      filter: 'agTextColumnFilter',
      width: 200,
    },
    {
      field: 'facilityType',
      headerName: 'Type',
      filter: 'agTextColumnFilter',
      width: 150,
    },
    {
      field: 'creditAgreement.agreementNumber',
      headerName: 'Credit Agreement',
      filter: 'agTextColumnFilter',
      width: 200,
      valueGetter: (params) => params.data.creditAgreement?.agreementNumber || 'N/A',
    },
    {
      field: 'creditAgreement.borrower.legalName',
      headerName: 'Borrower',
      filter: 'agTextColumnFilter',
      width: 200,
      valueGetter: (params) => {
        const borrower = params.data.creditAgreement?.borrower
        return borrower ? `${borrower.legalName}${borrower.dba ? ` (${borrower.dba})` : ''}` : 'N/A'
      }
    },
    {
      field: 'creditAgreement.lender.legalName',
      headerName: 'Lender',
      filter: 'agTextColumnFilter',
      width: 200,
      valueGetter: (params) => {
        const lender = params.data.creditAgreement?.lender
        return lender ? `${lender.legalName}${lender.dba ? ` (${lender.dba})` : ''}` : 'N/A'
      }
    },
    {
      field: 'commitmentAmount',
      headerName: 'Commitment',
      valueFormatter: (params) => formatCurrency(params.value),
      filter: 'agNumberColumnFilter',
      width: 150,
    },
    {
      field: 'availableAmount',
      headerName: 'Available',
      valueFormatter: (params) => formatCurrency(params.value),
      filter: 'agNumberColumnFilter',
      width: 150,
    },
    {
      field: 'currency',
      headerName: 'Currency',
      filter: 'agTextColumnFilter',
      width: 100,
    },
    {
      field: 'status',
      headerName: 'Status',
      filter: 'agTextColumnFilter',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'ACTIVE' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'maturityDate',
      headerName: 'Maturity',
      filter: 'agDateColumnFilter',
      width: 150,
      valueFormatter: (params) => format(new Date(params.value), 'MMM d, yyyy'),
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 300,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedFacility(params.data)
              setIsDetailsOpen(true)
            }}
          >
            Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedFacility(params.data)
              setIsHistoryOpen(true)
            }}
          >
            History
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Are you sure you want to reset this facility? This will delete all loans, trades, and history.')) {
                handleReset(params.data.id)
              }
            }}
          >
            Reset
          </Button>
        </div>
      ),
    },
  ], [])

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  if (!isLoading && facilities.length === 0) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <ScrollText className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No facilities</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            No facilities have been created yet. Create a credit agreement and add facilities to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-[600px] w-full">
        <DataGrid
          rowData={facilities}
          columnDefs={columnDefs}
        />
      </div>

      <FacilityDetailsModal
        facilityId={selectedFacility?.id}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <PositionHistoryModal
        facilityId={selectedFacility?.id}
        facility={selectedFacility}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />
    </>
  )
} 