'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { updateTradeStatus } from '@/server/actions/trade/updateTradeStatus'
import { toast } from 'sonner'
import { TradeStatus, type TradeWithRelations } from '@/server/types/trade'
import { formatCurrency } from '@/lib/utils'

interface TradeDetailsModalProps {
  trade: TradeWithRelations
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TradeDetailsModal({ trade, open, onOpenChange, onSuccess }: TradeDetailsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState('')

  const canConfirm = trade.status === TradeStatus.PENDING
  const canSettle = trade.status === TradeStatus.CONFIRMED
  const canClose = trade.status === TradeStatus.SETTLED

  const handleUpdateStatus = async (newStatus: keyof typeof TradeStatus) => {
    setIsSubmitting(true)
    try {
      await updateTradeStatus({
        id: trade.id,
        status: newStatus,
        description: description || undefined
      })
      toast.success('Trade status updated successfully')
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating trade status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update trade status')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Trade Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <div className="text-sm font-medium">{trade.status}</div>
            </div>
            <div>
              <Label>Par Amount</Label>
              <div className="text-sm font-medium">{formatCurrency(trade.parAmount)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price</Label>
              <div className="text-sm font-medium">{trade.price}%</div>
            </div>
            <div>
              <Label>Settlement Amount</Label>
              <div className="text-sm font-medium">{formatCurrency(trade.settlementAmount)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trade Date</Label>
              <div className="text-sm font-medium">
                {new Date(trade.tradeDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <Label>Settlement Date</Label>
              <div className="text-sm font-medium">
                {new Date(trade.settlementDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div>
            <Label>Seller</Label>
            <div className="text-sm font-medium">{trade.sellerCounterparty.entity.legalName}</div>
          </div>

          <div>
            <Label>Buyer</Label>
            <div className="text-sm font-medium">{trade.buyerCounterparty.entity.legalName}</div>
          </div>

          <div>
            <Label>Facility</Label>
            <div className="text-sm font-medium">{trade.facility.facilityName}</div>
          </div>

          {(canConfirm || canSettle || canClose) && (
            <>
              <div>
                <Label>Description (Optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a note about this status change"
                />
              </div>

              <div className="flex justify-end gap-2">
                {canConfirm && (
                  <Button
                    onClick={() => handleUpdateStatus(TradeStatus.CONFIRMED)}
                    disabled={isSubmitting}
                  >
                    Confirm Trade
                  </Button>
                )}
                {canSettle && (
                  <Button
                    onClick={() => handleUpdateStatus(TradeStatus.SETTLED)}
                    disabled={isSubmitting}
                  >
                    Settle Trade
                  </Button>
                )}
                {canClose && (
                  <Button
                    onClick={() => handleUpdateStatus(TradeStatus.CLOSED)}
                    disabled={isSubmitting}
                  >
                    Close Trade
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 