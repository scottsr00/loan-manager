'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { type TradeWithRelations } from '@/server/types/trade'
import { TradeDetailsModal } from './TradeDetailsModal'
import { EyeIcon } from 'lucide-react'

interface TradesTableProps {
  trades: TradeWithRelations[]
  onTradeUpdated?: () => void
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return <Badge variant="secondary">Pending</Badge>
    case 'CONFIRMED':
      return <Badge variant="default">Confirmed</Badge>
    case 'SETTLED':
      return <Badge variant="success">Settled</Badge>
    case 'CLOSED':
      return <Badge variant="outline">Closed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function TradesTable({ trades, onTradeUpdated }: TradesTableProps) {
  const [selectedTrade, setSelectedTrade] = useState<TradeWithRelations | null>(null)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trade Date</TableHead>
            <TableHead>Facility</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Par Amount</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Settlement Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>{new Date(trade.tradeDate).toLocaleDateString()}</TableCell>
              <TableCell>{trade.facility.facilityName}</TableCell>
              <TableCell>{trade.sellerCounterparty.entity.legalName}</TableCell>
              <TableCell>{trade.buyerCounterparty.entity.legalName}</TableCell>
              <TableCell>{formatCurrency(trade.parAmount)}</TableCell>
              <TableCell>{trade.price}%</TableCell>
              <TableCell>{formatCurrency(trade.settlementAmount)}</TableCell>
              <TableCell>{getStatusBadge(trade.status)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTrade(trade)}
                  title="View Details"
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedTrade && (
        <TradeDetailsModal
          trade={selectedTrade}
          open={!!selectedTrade}
          onOpenChange={(open) => !open && setSelectedTrade(null)}
          onSuccess={onTradeUpdated}
        />
      )}
    </>
  )
} 