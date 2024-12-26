import { useCallback, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'
import { ModuleRegistry } from '@ag-grid-community/core'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { ColDef, GridOptions, GridReadyEvent, RowClickedEvent } from 'ag-grid-community'

// Register required modules
ModuleRegistry.registerModules([ClientSideRowModelModule])

interface DataGridProps {
  rowData: any[]
  columnDefs: ColDef[]
  defaultColDef?: ColDef
  gridOptions?: GridOptions
  onGridReady?: (event: GridReadyEvent) => void
  className?: string
  onRowClick?: (params: RowClickedEvent) => void
  masterDetail?: boolean
  detailCellRenderer?: any
}

export function DataGrid({
  rowData,
  columnDefs,
  defaultColDef,
  gridOptions,
  onGridReady,
  className = 'h-[600px] w-full',
  onRowClick,
  masterDetail,
  detailCellRenderer
}: DataGridProps) {
  const defaultColDefMemo = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    ...defaultColDef
  }), [defaultColDef])

  const gridOptionsMemo = useMemo<GridOptions>(() => ({
    pagination: true,
    paginationAutoPageSize: true,
    rowClass: onRowClick ? 'cursor-pointer' : '',
    masterDetail: masterDetail,
    detailCellRenderer: detailCellRenderer,
    ...gridOptions
  }), [gridOptions, onRowClick, masterDetail, detailCellRenderer])

  const handleExportCsv = useCallback(() => {
    const params = {
      fileName: 'export.csv',
    }
    if (gridOptionsMemo.api) {
      gridOptionsMemo.api.exportDataAsCsv(params)
    }
  }, [gridOptionsMemo])

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          Export to CSV
        </button>
      </div>
      <div className={`ag-theme-alpine dark:ag-theme-alpine-dark ${className}`}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDefMemo}
          gridOptions={gridOptionsMemo}
          onGridReady={onGridReady}
          onRowClicked={onRowClick}
          suppressRowClickSelection={true}
        />
      </div>
    </div>
  )
} 