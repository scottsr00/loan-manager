'use client'

import { type TradeWithRelations } from '@/server/types/trade'
import { NewTradeModal } from './NewTradeModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TradesTable } from './TradesTable'

interface TradeHistoryProps {
  trades: TradeWithRelations[]
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Trade History</CardTitle>
        <NewTradeModal 
          onSuccess={() => {
            window.location.reload()
          }}
        />
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <TradesTable
            trades={trades}
            onTradeUpdated={() => {
              window.location.reload()
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}