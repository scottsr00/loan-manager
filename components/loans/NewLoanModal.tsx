'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createLoan } from '@/server/actions/loan/createLoan'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

interface NewLoanModalProps {
  facilityId: string
  facilityName: string
  availableAmount: number
  currency: string
  margin: number
  onSuccess?: () => void
}

export function NewLoanModal({ facilityId, facilityName, availableAmount, currency, margin, onSuccess }: NewLoanModalProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [interestPeriod, setInterestPeriod] = useState<'1M' | '3M'>('1M')
  const [baseRate, setBaseRate] = useState('')
  const [effectiveRate, setEffectiveRate] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate effective rate when base rate changes
  const handleBaseRateChange = (value: string) => {
    setBaseRate(value)
    const baseRateNum = parseFloat(value)
    if (!isNaN(baseRateNum)) {
      // Calculate with 5 decimal places
      setEffectiveRate(Number((baseRateNum + margin).toFixed(5)))
    } else {
      setEffectiveRate(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const amountValue = parseFloat(amount)
      const baseRateValue = Number(parseFloat(baseRate).toFixed(5))

      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Please enter a valid amount')
      }

      if (isNaN(baseRateValue)) {
        throw new Error('Please enter a valid base rate')
      }

      if (amountValue > availableAmount) {
        throw new Error(`Amount exceeds available amount of ${formatCurrency(availableAmount)}`)
      }

      await createLoan({
        facilityId,
        amount: amountValue,
        currency,
        effectiveDate: new Date(),
        description: `Loan drawdown from ${facilityName}`,
        interestPeriod,
        baseRate: baseRateValue,
        effectiveRate: effectiveRate ?? undefined
      })

      toast.success('Loan Created', {
        description: `Successfully created loan for ${formatCurrency(amountValue)}`,
      })

      setOpen(false)
      setAmount('')
      setBaseRate('')
      setEffectiveRate(null)
      onSuccess?.()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to create loan',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">New Loan</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facility">Facility</Label>
            <Input id="facility" value={facilityName} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="available">Available Amount</Label>
            <Input id="available" value={formatCurrency(availableAmount)} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Loan Amount ({currency})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={availableAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter loan amount"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestPeriod">Interest Period</Label>
            <Select value={interestPeriod} onValueChange={(value: '1M' | '3M') => setInterestPeriod(value)}>
              <SelectTrigger id="interestPeriod">
                <SelectValue placeholder="Select interest period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseRate">Base Rate (%)</Label>
            <Input
              id="baseRate"
              type="number"
              step="0.00001"
              min="0"
              value={baseRate}
              onChange={(e) => handleBaseRateChange(e.target.value)}
              placeholder="Enter base rate"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="effectiveRate">Effective Rate (%)</Label>
            <Input
              id="effectiveRate"
              value={effectiveRate !== null ? effectiveRate.toFixed(5) : ''}
              disabled
            />
            <p className="text-sm text-muted-foreground">Base Rate + {margin.toFixed(5)}% Margin</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create Loan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 