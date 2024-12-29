import { Badge } from '@/components/ui/badge'
import { getDatabaseInfo } from '@/app/actions/getDatabaseInfo'

type DatabaseInfo = {
  provider: string
  version: string
  database: string
  size: string
  activeConnections: number
  tableCount: number
  totalRows: string
  status: string
  error?: string
}

export async function DatabaseInfo() {
  const dbInfo = await getDatabaseInfo() as DatabaseInfo

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={dbInfo.status === 'connected' ? 'success' : 'destructive'}>
            {dbInfo.status === 'connected' ? 'Connected' : 'Error'}
          </Badge>
        </div>
        <Badge variant="outline" className="capitalize">
          {dbInfo.provider}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="font-medium">Database:</div>
        <div className="text-muted-foreground">{dbInfo.database}</div>

        <div className="font-medium">Size:</div>
        <div className="text-muted-foreground">{dbInfo.size}</div>

        <div className="font-medium">Tables:</div>
        <div className="text-muted-foreground">{dbInfo.tableCount}</div>

        <div className="font-medium">Total Records:</div>
        <div className="text-muted-foreground">
          {parseInt(dbInfo.totalRows || '0').toLocaleString()}
        </div>

        <div className="font-medium">Active Connections:</div>
        <div className="text-muted-foreground">{dbInfo.activeConnections}</div>
      </div>

      {dbInfo.error && (
        <div className="text-sm text-destructive mt-2">
          Error: {dbInfo.error}
        </div>
      )}
    </div>
  )
} 