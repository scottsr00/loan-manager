'use client'

import { useState, useEffect } from 'react'
import { getTradeHistory, type Trade } from '@/app/actions/getTradeHistory'
import { calculateCarry } from '@/app/actions/calculateCarry'
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
import { Info } from 'lucide-react'

export function TradeHistoryComponent() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculatingCarry, setIsCalculatingCarry] = useState(false)

  const loadTradeHistory = async () => {
    try {
      const tradeHistory = await getTradeHistory()
      setTrades(tradeHistory)
    } catch (error) {
      console.error('Error loading trade history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCarry = async () => {
    setIsCalculatingCarry(true)
    try {
      await calculateCarry()
      await loadTradeHistory()
    } catch (error) {
      console.error('Error updating carry:', error)
    } finally {
      setIsCalculatingCarry(false)
    }
  }

  useEffect(() => {
    loadTradeHistory()
  }, [])

  useEffect(() => {
    const interval = setInterval(updateCarry, 60 * 60 * 1000) // Update every hour
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return <div>Loading trade history...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Trade History</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={updateCarry}
            disabled={isCalculatingCarry}
          >
            {isCalculatingCarry ? (
              <>Calculating Carry...</>
            ) : (
              <>Update Carry</>
            )}
          </Button>
          <BookTradeModal onTradeBooked={loadTradeHistory}>
            <Button>
              <span className="text-lg mr-2">+</span>
              <span>Add New Trade</span>
            </Button>
          </BookTradeModal>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trade Date</TableHead>
              <TableHead>Deal Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Accrued Interest</TableHead>
              <TableHead className="text-right">Cost of Carry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Settlement</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TradeDetailsModal key={trade.id} trade={trade}>
                <TableRow className="cursor-pointer hover:bg-muted/50">
                  <TableCell>{new Date(trade.tradeDate).toLocaleDateString()}</TableCell>
                  <TableCell>{trade.dealName}</TableCell>
                  <TableCell>
                    <Badge variant={trade.tradeType === 'Buy' ? 'default' : 'secondary'}>
                      {trade.tradeType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(trade.quantity)}
                  </TableCell>
                  <TableCell className="text-right">{trade.price.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(trade.accruedInterest)}
                  </TableCell>
                  <TableCell className="text-right">
                    {trade.status === 'Open' ? (
                      <div className="flex items-center justify-end gap-1">
                        {formatCurrency(trade.costOfCarryAccrued)}
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.status === 'Open' ? 'outline' : 'default'}>
                      {trade.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(trade.expectedSettlementDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              </TradeDetailsModal>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}