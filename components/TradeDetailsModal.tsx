'use client'

import { useState, useEffect } from 'react'
import { Trade } from '@/app/actions/getTradeHistory'
import { TradeComment, getTradeComments } from '@/app/actions/getTradeComments'
import { addTradeComment } from '@/app/actions/addTradeComment'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { MessageCircle, Loader2 } from 'lucide-react'

interface TradeDetailsModalProps {
  trade: Trade
  children: React.ReactNode
}

export function TradeDetailsModal({ trade, children }: TradeDetailsModalProps) {
  const [comments, setComments] = useState<TradeComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState<string>('Agent')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadComments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const tradeComments = await getTradeComments(trade.id)
      setComments(tradeComments)
    } catch (err) {
      setError('Failed to load comments')
      console.error('Error loading comments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [trade.id])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    setError(null)
    try {
      await addTradeComment({
        tradeId: trade.id,
        author: commentAuthor,
        content: newComment.trim()
      })
      setNewComment('')
      await loadComments()
    } catch (err) {
      setError('Failed to add comment')
      console.error('Error submitting comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date))
  }

  const calculateDaysOpen = () => {
    const start = new Date(trade.tradeDate)
    const end = trade.status === 'Open' ? new Date() : new Date(trade.expectedSettlementDate)
    return Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  }

  const getCommentStyle = (author: string) => {
    switch (author) {
      case 'Buyer':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'Seller':
        return 'bg-green-500/10 border-green-500/20'
      case 'Agent':
        return 'bg-orange-500/10 border-orange-500/20'
      default:
        return 'bg-muted'
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Trade Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[2fr,1fr] gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Trade Information</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Deal Name:</dt>
                    <dd className="font-medium">{trade.dealName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Trade Type:</dt>
                    <dd className="font-medium">{trade.tradeType}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Quantity:</dt>
                    <dd className="font-medium">{formatCurrency(trade.quantity)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Price:</dt>
                    <dd className="font-medium">{trade.price.toFixed(2)}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Notional:</dt>
                    <dd className="font-medium">{formatCurrency(trade.quantity * trade.price / 100)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Status:</dt>
                    <dd className="font-medium">{trade.status}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="font-medium mb-2">Dates</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Trade Date:</dt>
                    <dd className="font-medium">{formatDate(trade.tradeDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Settlement Date:</dt>
                    <dd className="font-medium">{formatDate(trade.expectedSettlementDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Days Open:</dt>
                    <dd className="font-medium">{calculateDaysOpen()} days</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Cost of Carry</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Accrued:</dt>
                    <dd className="font-medium">{formatCurrency(trade.costOfCarryAccrued)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Rate Type:</dt>
                    <dd className="font-medium">
                      {trade.tradeType === 'Sell' ? 'OBFR (Receiving)' : 'Loan Coupon (Receiving)'}
                    </dd>
                  </div>
                  {trade.lastCarryCalculation && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Last Calculated:</dt>
                      <dd className="font-medium">{formatDate(trade.lastCarryCalculation)}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div>
                <h3 className="font-medium mb-2">Interest</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Accrued Interest:</dt>
                    <dd className="font-medium">{formatCurrency(trade.accruedInterest)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="border-l pl-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments
              </h3>
              <span className="text-sm text-muted-foreground">
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </span>
            </div>

            {error && (
              <div className="mb-4 p-2 text-sm text-red-500 bg-red-100 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select 
                    value={commentAuthor} 
                    onValueChange={setCommentAuthor}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agent">Agent</SelectItem>
                      <SelectItem value="Buyer">Buyer</SelectItem>
                      <SelectItem value="Seller">Seller</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="relative"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Add Comment'
                    )}
                  </Button>
                </div>
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={handleCommentChange}
                  className="min-h-[100px]"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-lg border ${getCommentStyle(comment.author)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No comments yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 