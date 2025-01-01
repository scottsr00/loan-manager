'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { getTrade } from '@/server/actions/trade/getTrades'
import { type TradeWithRelations, TradeStatus, type TradeTransaction } from '@/server/types/trade'

interface TradeDetailsModalProps {
  tradeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>
    case 'FAILED':
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function TransactionHistory({ transactions }: { transactions: TradeTransaction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Processed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.effectiveDate), 'PP')}</TableCell>
                <TableCell>{transaction.activityType}</TableCell>
                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.processedBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function TradeDetailsModal({ tradeId, open, onOpenChange }: TradeDetailsModalProps) {
  const [trade, setTrade] = useState<TradeWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open && tradeId) {
      setIsLoading(true)
      getTrade(tradeId)
        .then(data => {
          setTrade(data)
          setIsLoading(false)
        })
        .catch(error => {
          console.error('Error loading trade:', error)
          setIsLoading(false)
        })
    } else {
      setTrade(null)
      setIsLoading(true)
    }
  }, [tradeId, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trade Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !trade ? (
          <div className="py-4 text-center text-muted-foreground">
            Trade not found
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trade Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Facility Details</h4>
                    <div className="space-y-1">
                      <p>{trade.facility.facilityName}</p>
                      <p className="text-sm text-muted-foreground">
                        Agreement: {trade.facility.creditAgreement.agreementNumber}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Trade Status</h4>
                    <div className="space-y-1">
                      <div>{getStatusBadge(trade.status)}</div>
                      <p className="text-sm text-muted-foreground">
                        Created: {format(new Date(trade.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Seller</h4>
                    <p>{trade.seller.entity.legalName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Buyer</h4>
                    <p>{trade.buyer.entity.legalName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Trade Details</h4>
                    <div className="space-y-1">
                      <p>Par Amount: {formatCurrency(trade.parAmount)}</p>
                      <p>Price: {trade.price.toFixed(2)}%</p>
                      <p>Settlement Amount: {formatCurrency(trade.settlementAmount)}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Dates</h4>
                    <div className="space-y-1">
                      <p>Trade Date: {format(new Date(trade.tradeDate), 'PP')}</p>
                      <p>Settlement Date: {format(new Date(trade.settlementDate), 'PP')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ScrollArea className="h-[400px]">
              <TransactionHistory transactions={trade.transactions} />
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 