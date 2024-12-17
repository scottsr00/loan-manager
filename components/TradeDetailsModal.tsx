'use client'

import { useState } from 'react'
import { useTradeComments } from '@/hooks/useTrades'
import { formatCurrency } from '@/lib/utils'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from 'lucide-react'
import type { Trade } from '@/server/actions/trade/getTradeHistory'

interface TradeDetailsModalProps {
  trade: Trade | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TradeDetailsModal({
  trade,
  open,
  onOpenChange,
}: TradeDetailsModalProps) {
  const [newComment, setNewComment] = useState('')
  const { comments, isLoading, isError, addComment } = useTradeComments(trade?.id || 0)

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    await addComment(newComment)
    setNewComment('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trade Details</DialogTitle>
          <DialogDescription>
            View and manage trade information
          </DialogDescription>
        </DialogHeader>

        {trade && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Deal Name</h4>
                <p className="text-sm text-muted-foreground">{trade.dealName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Trade Type</h4>
                <Badge variant={trade.tradeType === 'Buy' ? 'default' : 'secondary'}>
                  {trade.tradeType}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Quantity</h4>
                <p className="text-sm text-muted-foreground">{formatCurrency(trade.quantity)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Price</h4>
                <p className="text-sm text-muted-foreground">{trade.price.toFixed(2)}%</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Counterparty</h4>
                <p className="text-sm text-muted-foreground">{trade.counterparty.legalName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <Badge variant={trade.status === 'Completed' ? 'success' : 'warning'}>
                  {trade.status}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Trade Date</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(trade.tradeDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Settlement Date</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(trade.expectedSettlementDate).toLocaleDateString()}
                </p>
              </div>
              {trade.costOfCarryAccrued > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Cost of Carry</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(trade.costOfCarryAccrued)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Comments</h4>
                <div className="flex items-center gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button onClick={handleAddComment}>Add</Button>
                </div>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : isError ? (
                  <p className="text-sm text-destructive text-center">
                    Error loading comments. Please try again later.
                  </p>
                ) : !comments?.length ? (
                  <p className="text-sm text-muted-foreground text-center">
                    No comments yet
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 