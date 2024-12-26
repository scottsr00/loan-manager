'use client'

import { useState, useEffect, useMemo } from 'react'
import { type ColDef } from 'ag-grid-community'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DataGrid } from '@/components/ui/data-grid'
import { getFacilities } from '@/server/actions/loan/getFacilities'
import { formatCurrency } from '@/lib/utils'
import { FacilityDetailsModal } from './FacilityDetailsModal'

export function FacilityList() {
  const [facilities, setFacilities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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
      field: 'creditAgreement.borrower.legalName',
      headerName: 'Borrower',
      filter: 'agTextColumnFilter',
      width: 200,
      valueGetter: (params) => {
        const entity = params.data.creditAgreement?.borrower
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
        <Badge variant={params.value === 'ACTIVE' ? 'success' : 'default'}>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'interestType',
      headerName: 'Interest Type',
      filter: 'agTextColumnFilter',
      width: 150,
    },
    {
      field: 'baseRate',
      headerName: 'Base Rate',
      filter: 'agTextColumnFilter',
      width: 120,
    },
    {
      field: 'margin',
      headerName: 'Margin (%)',
      valueFormatter: (params) => params.value ? `${params.value}%` : '',
      filter: 'agNumberColumnFilter',
      width: 120,
    },
  ], [])

  const handleRowClick = (params: any) => {
    setSelectedFacility(params.data)
    setIsDetailsOpen(true)
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <>
      <div className="h-[600px] w-full">
        <DataGrid
          rowData={facilities}
          columnDefs={columnDefs}
          onRowClick={handleRowClick}
        />
      </div>

      <FacilityDetailsModal
        facility={selectedFacility}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  )
} 