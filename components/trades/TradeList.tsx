'use client'

import { useState } from 'react'
import { type TradeWithRelations, TradeStatus } from '@/server/types/trade'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { updateTradeStatus } from '@/server/actions/trade/updateTradeStatus'
import { toast } from 'sonner'
import { TradeDetailsModal } from './TradeDetailsModal'

interface TradeListProps {
  trades: TradeWithRelations[]
  onUpdate?: () => void
}

function getStatusBadge(status: keyof typeof TradeStatus) {
  switch (status) {
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>
    case 'CONFIRMED':
      return <Badge>Confirmed</Badge>
    case 'SETTLED':
      return <Badge>Settled</Badge>
    case 'CLOSED':
      return <Badge variant="success">Closed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function TradeList({ trades, onUpdate }: TradeListProps) {
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (tradeId: string, newStatus: keyof typeof TradeStatus) => {
    try {
      setIsUpdating(true)
      await updateTradeStatus({
        id: tradeId,
        status: newStatus
      })
      toast.success('Trade status updated successfully')
      onUpdate?.()
    } catch (error) {
      console.error('Error updating trade status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update trade status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getNextStatus = (currentStatus: keyof typeof TradeStatus) => {
    switch (currentStatus) {
      case 'PENDING':
        return 'CONFIRMED'
      case 'CONFIRMED':
        return 'SETTLED'
      case 'SETTLED':
        return 'CLOSED'
      default:
        return null
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trade Date</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Settlement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => {
                  const nextStatus = getNextStatus(trade.status as keyof typeof TradeStatus)
                  return (
                    <TableRow key={trade.id} className="group">
                      <TableCell>{format(new Date(trade.tradeDate), 'PP')}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{trade.facility.facilityName}</div>
                          <div className="text-sm text-muted-foreground">
                            {trade.facility.creditAgreement.agreementNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{trade.seller.entity.legalName}</TableCell>
                      <TableCell>{trade.buyer.entity.legalName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{formatCurrency(trade.parAmount)} (Par)</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(trade.settlementAmount)} (Settlement)
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{trade.price.toFixed(2)}%</TableCell>
                      <TableCell>{format(new Date(trade.settlementDate), 'PP')}</TableCell>
                      <TableCell>{getStatusBadge(trade.status as keyof typeof TradeStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {nextStatus && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(trade.id, nextStatus as keyof typeof TradeStatus)}
                              disabled={isUpdating}
                            >
                              {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTrade(trade.id)}
                          >
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <TradeDetailsModal
        tradeId={selectedTrade || ''}
        open={!!selectedTrade}
        onOpenChange={(open) => !open && setSelectedTrade(null)}
      />
    </>
  )
} 