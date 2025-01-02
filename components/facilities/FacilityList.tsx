'use client'

import { useState, useEffect, useMemo } from 'react'
import { type ColDef } from 'ag-grid-community'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataGrid } from '@/components/ui/data-grid'
import { getFacilities } from '@/server/actions/loan/getFacilities'
import { formatCurrency } from '@/lib/utils'
import { FacilityDetailsModal } from './FacilityDetailsModal'
import { PositionHistoryModal } from '@/components/positions/PositionHistoryModal'
import '@/lib/ag-grid-init'

export function FacilityList() {
  const [facilities, setFacilities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
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

    loadFacilities()
  }, [])

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
      field: 'creditAgreement.borrower.entity.legalName',
      headerName: 'Borrower',
      filter: 'agTextColumnFilter',
      width: 200,
      valueGetter: (params) => {
        const entity = params.data.creditAgreement?.borrower?.entity
        return entity ? `${entity.legalName}${entity.dba ? ` (${entity.dba})` : ''}` : 'N/A'
      }
    },
    {
      field: 'creditAgreement.lender.legalName',
      headerName: 'Lender',
      filter: 'agTextColumnFilter',
      width: 200,
      valueGetter: (params) => {
        const entity = params.data.creditAgreement?.lender
        return entity ? `${entity.legalName}${entity.dba ? ` (${entity.dba})` : ''}` : 'N/A'
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
      width: 200,
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
        </div>
      ),
    },
  ], [])

  if (error) {
    return <div className="text-destructive">{error}</div>
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