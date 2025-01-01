'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTrade } from '@/server/actions/trade/createTrade'
import { toast } from 'sonner'
import { addDays } from 'date-fns'
import { useLenders } from '@/hooks/useLenders'
import { type Lender } from '@prisma/client'
import { getCreditAgreementList } from '@/server/actions/creditAgreement/getCreditAgreementList'

interface LenderWithEntity {
  id: string
  legalName: string
}

interface CreditAgreement {
  id: string
  agreementNumber: string
  borrower: {
    name: string
  }
  facilities: Facility[]
}

interface Facility {
  id: string
  facilityName: string
  commitmentAmount: number
  maturityDate: Date
  currency: string
}

interface NewTradeModalProps {
  facilityId?: string
  facilityName?: string
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function NewTradeModal({ 
  facilityId, 
  facilityName, 
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger
}: NewTradeModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { lenders = [], isLoading: isLoadingLenders } = useLenders()
  const [creditAgreements, setCreditAgreements] = useState<CreditAgreement[]>([])
  const [isLoadingCreditAgreements, setIsLoadingCreditAgreements] = useState(false)
  const today = new Date()

  const [formData, setFormData] = useState({
    creditAgreementId: '',
    facilityId: facilityId || '',
    sellerLenderId: '',
    buyerLenderId: '',
    tradeDate: today,
    settlementDate: addDays(today, 3), // T+3 default settlement
    parAmount: '',
    price: '',
    description: ''
  })

  // Get available facilities based on selected credit agreement
  const availableFacilities = useMemo(() => {
    const selectedCA = creditAgreements.find(ca => ca.id === formData.creditAgreementId)
    return selectedCA?.facilities || []
  }, [creditAgreements, formData.creditAgreementId])

  useEffect(() => {
    if (facilityId) {
      setFormData(prev => ({ ...prev, facilityId }))
    }
  }, [facilityId])

  useEffect(() => {
    async function loadCreditAgreements() {
      try {
        setIsLoadingCreditAgreements(true)
        const data = await getCreditAgreementList()
        setCreditAgreements(data)
      } catch (error) {
        console.error('Error loading credit agreements:', error)
        toast.error('Failed to load credit agreements')
      } finally {
        setIsLoadingCreditAgreements(false)
      }
    }

    if (!facilityId && (controlledOpen || open)) {
      loadCreditAgreements()
    }
  }, [facilityId, controlledOpen, open])

  // Reset facility when credit agreement changes
  useEffect(() => {
    if (formData.creditAgreementId && formData.facilityId) {
      const selectedCA = creditAgreements.find(ca => ca.id === formData.creditAgreementId)
      const facilityExists = selectedCA?.facilities.some(f => f.id === formData.facilityId)
      if (!facilityExists) {
        setFormData(prev => ({ ...prev, facilityId: '' }))
      }
    }
  }, [formData.creditAgreementId, formData.facilityId, creditAgreements])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      // Basic validation
      if (!formData.facilityId) {
        throw new Error('Please select a facility')
      }
      if (!formData.sellerLenderId || !formData.buyerLenderId) {
        throw new Error('Please select both seller and buyer')
      }
      if (formData.sellerLenderId === formData.buyerLenderId) {
        throw new Error('Seller and buyer cannot be the same')
      }
      if (!formData.parAmount || parseFloat(formData.parAmount) <= 0) {
        throw new Error('Please enter a valid par amount')
      }
      if (!formData.price || parseFloat(formData.price) <= 0 || parseFloat(formData.price) > 100) {
        throw new Error('Please enter a valid price (0-100)')
      }

      // Facility-specific validation
      const selectedFacility = availableFacilities.find(f => f.id === formData.facilityId)
      if (selectedFacility) {
        if (parseFloat(formData.parAmount) > selectedFacility.commitmentAmount) {
          throw new Error('Trade amount cannot exceed facility commitment amount')
        }
        if (formData.settlementDate > selectedFacility.maturityDate) {
          throw new Error('Settlement date cannot be after facility maturity date')
        }
      }

      const tradeData = {
        facilityId: formData.facilityId,
        sellerLenderId: formData.sellerLenderId,
        buyerLenderId: formData.buyerLenderId,
        tradeDate: formData.tradeDate,
        settlementDate: formData.settlementDate,
        parAmount: parseFloat(formData.parAmount),
        price: parseFloat(formData.price),
        description: formData.description || undefined
      }

      await createTrade(tradeData)
      toast.success('Trade created successfully')
      if (controlledOnOpenChange) {
        controlledOnOpenChange(false)
      } else {
        setOpen(false)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Error creating trade:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create trade')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const dialogProps = {
    open: controlledOpen !== undefined ? controlledOpen : open,
    onOpenChange: controlledOnOpenChange || setOpen
  }

  return (
    <Dialog {...dialogProps}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">New Trade</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Trade</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!facilityId && (
            <>
              <div>
                <Label>Credit Agreement</Label>
                <Select
                  value={formData.creditAgreementId}
                  onValueChange={(value) => handleInputChange('creditAgreementId', value)}
                  disabled={isLoadingCreditAgreements}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select credit agreement" />
                  </SelectTrigger>
                  <SelectContent>
                    {creditAgreements.map((ca) => (
                      <SelectItem key={ca.id} value={ca.id}>
                        {ca.borrower.name} - {ca.agreementNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Facility</Label>
                <Select
                  value={formData.facilityId}
                  onValueChange={(value) => handleInputChange('facilityId', value)}
                  disabled={!formData.creditAgreementId || availableFacilities.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFacilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.facilityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Seller</Label>
              <Select
                value={formData.sellerLenderId}
                onValueChange={(value) => handleInputChange('sellerLenderId', value)}
                disabled={isLoadingLenders}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select seller" />
                </SelectTrigger>
                <SelectContent>
                  {lenders.map((lender: LenderWithEntity) => (
                    <SelectItem key={lender.id} value={lender.id}>
                      {lender.legalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Buyer</Label>
              <Select
                value={formData.buyerLenderId}
                onValueChange={(value) => handleInputChange('buyerLenderId', value)}
                disabled={isLoadingLenders}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select buyer" />
                </SelectTrigger>
                <SelectContent>
                  {lenders.map((lender: LenderWithEntity) => (
                    <SelectItem key={lender.id} value={lender.id}>
                      {lender.legalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trade Date</Label>
              <DatePicker
                value={formData.tradeDate}
                onChange={(date) => handleInputChange('tradeDate', date)}
              />
            </div>

            <div>
              <Label>Settlement Date</Label>
              <DatePicker
                value={formData.settlementDate}
                onChange={(date) => handleInputChange('settlementDate', date)}
                disabled={(date: Date) => date < formData.tradeDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Par Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.parAmount}
                onChange={(e) => handleInputChange('parAmount', e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <Label>Price (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Enter price"
              />
            </div>
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <Input
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add description"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dialogProps.onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create Trade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 