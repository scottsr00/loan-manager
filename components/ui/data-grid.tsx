import { useCallback, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { type ColDef, type GridOptions, type GridReadyEvent, type RowClickedEvent } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

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

  const onRowClicked = useCallback((params: RowClickedEvent) => {
    if (onRowClick) {
      onRowClick(params)
    }
  }, [onRowClick])

  return (
    <div className={`ag-theme-alpine ${className}`}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDefMemo}
        gridOptions={gridOptionsMemo}
        onGridReady={onGridReady}
        onRowClicked={onRowClicked}
        theme="legacy"
      />
    </div>
  )
} 