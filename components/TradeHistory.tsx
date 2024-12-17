'use client'

import { useState } from 'react'
import { useTrades } from '@/hooks/useTrades'
import { calculateCarry } from '@/server/actions/trade'
import { Button } from "@/components/ui/button"
import { TradeDetailsModal } from './TradeDetailsModal'
import { BookTradeModal } from './BookTradeModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from '@/lib/utils'
import { Info, Loader2 } from 'lucide-react'
import type { Trade } from '@/server/actions/trade/getTradeHistory'

export function TradeHistory() {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isBookTradeOpen, setIsBookTradeOpen] = useState(false)
  const { trades, isLoading, isError, book } = useTrades()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center p-8 text-destructive">
        Error loading trades. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Trade History</h2>
        <Button onClick={() => setIsBookTradeOpen(true)}>Book Trade</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Counterparty</TableHead>
            <TableHead>Trade Date</TableHead>
            <TableHead>Settlement</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Carry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!trades?.length ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                No trades found
              </TableCell>
            </TableRow>
          ) : (
            trades.map((trade) => (
              <TableRow
                key={trade.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  setSelectedTrade(trade)
                  setIsDetailsOpen(true)
                }}
              >
                <TableCell>{trade.dealName}</TableCell>
                <TableCell>
                  <Badge variant={trade.tradeType === 'Buy' ? 'default' : 'secondary'}>
                    {trade.tradeType}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(trade.quantity)}</TableCell>
                <TableCell>{trade.price.toFixed(2)}%</TableCell>
                <TableCell>{trade.counterparty.legalName}</TableCell>
                <TableCell>{new Date(trade.tradeDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(trade.expectedSettlementDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={trade.status === 'Completed' ? 'success' : 'warning'}>
                    {trade.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {trade.costOfCarryAccrued > 0 && (
                    <div className="flex items-center gap-1">
                      <span>{formatCurrency(trade.costOfCarryAccrued)}</span>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TradeDetailsModal
        trade={selectedTrade}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <BookTradeModal
        open={isBookTradeOpen}
        onOpenChange={setIsBookTradeOpen}
        onTradeBooked={book}
      />
    </div>
  )
}