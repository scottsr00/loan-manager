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
import { getCounterparties } from '@/server/actions/counterparty/getCounterparties'
import { getFacilityPositions } from '@/server/actions/facility/getFacilityPositions'
import { createLenderCounterparty } from '@/server/actions/counterparty/createLenderCounterparty'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface LenderWithEntity {
  id: string
  legalName: string
}

interface CounterpartyWithEntity {
  id: string
  name: string
  entityId: string
  type: {
    id: string
    name: string
  }
  status: string
}

interface FacilityPositionInfo {
  id: string
  name: string
  amount: number
  share: number
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
  const [isLoadingCreditAgreements, setIsLoadingCreditAgreements] = useState(true)
  const [creditAgreements, setCreditAgreements] = useState<CreditAgreement[]>([])
  const [counterparties, setCounterparties] = useState<CounterpartyWithEntity[]>([])
  const [facilityPositions, setFacilityPositions] = useState<FacilityPositionInfo[]>([])
  const [isLoadingCounterparties, setIsLoadingCounterparties] = useState(false)
  const [isLoadingPositions, setIsLoadingPositions] = useState(false)
  const { lenders, isLoading: isLoadingLenders } = useLenders()

  const [formData, setFormData] = useState({
    creditAgreementId: '',
    facilityId: facilityId || '',
    sellerLenderId: '',
    buyerLenderId: '',
    tradeDate: new Date(),
    settlementDate: addDays(new Date(), 1),
    parAmount: '',
    price: '',
    description: ''
  })

  useEffect(() => {
    const loadCreditAgreements = async () => {
      try {
        const data = await getCreditAgreementList()
        setCreditAgreements(data)
      } catch (error) {
        console.error('Error loading credit agreements:', error)
        toast.error('Failed to load credit agreements')
      } finally {
        setIsLoadingCreditAgreements(false)
      }
    }

    const loadCounterparties = async () => {
      setIsLoadingCounterparties(true)
      try {
        const data = await getCounterparties()
        setCounterparties(data)
      } catch (error) {
        console.error('Error fetching counterparties:', error)
        toast.error('Failed to fetch counterparties')
      } finally {
        setIsLoadingCounterparties(false)
      }
    }

    loadCreditAgreements()
    loadCounterparties()
  }, [])

  useEffect(() => {
    const loadFacilityPositions = async () => {
      if (!formData.facilityId) return
      
      setIsLoadingPositions(true)
      try {
        const positions = await getFacilityPositions(formData.facilityId)
        console.log('Loaded facility positions:', positions)
        setFacilityPositions(positions)
      } catch (error) {
        console.error('Error loading facility positions:', error)
        toast.error('Failed to load facility positions')
      } finally {
        setIsLoadingPositions(false)
      }
    }

    loadFacilityPositions()
  }, [formData.facilityId])

  const availableFacilities = useMemo(() => {
    const selectedAgreement = creditAgreements.find(ca => ca.id === formData.creditAgreementId)
    return selectedAgreement?.facilities || []
  }, [creditAgreements, formData.creditAgreementId])

  const availableSellers = useMemo(() => {
    // Use facility positions directly for sellers
    return facilityPositions.map(pos => ({
      id: pos.id,
      name: pos.name
    }))
  }, [facilityPositions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.facilityId) {
        throw new Error('Please select a facility')
      }
      if (!formData.sellerLenderId) {
        throw new Error('Please select a seller')
      }
      if (!formData.buyerLenderId) {
        throw new Error('Please select a buyer')
      }
      if (!formData.tradeDate) {
        throw new Error('Please select a trade date')
      }
      if (!formData.settlementDate) {
        throw new Error('Please select a settlement date')
      }
      if (!formData.parAmount) {
        throw new Error('Please enter a par amount')
      }
      if (!formData.price) {
        throw new Error('Please enter a price')
      }

      // Get the seller's entity ID from the facility positions
      const sellerPosition = facilityPositions.find(pos => pos.id === formData.sellerLenderId)
      if (!sellerPosition) {
        throw new Error('Seller position not found')
      }

      // Get or create a counterparty for the seller
      const sellerCounterparty = await createLenderCounterparty(sellerPosition.id)

      const tradeData = {
        facilityId: formData.facilityId,
        sellerCounterpartyId: sellerCounterparty.id,
        buyerCounterpartyId: formData.buyerLenderId,
        parAmount: parseFloat(formData.parAmount),
        price: parseFloat(formData.price),
        settlementDate: formData.settlementDate.toISOString(),
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
                disabled={isLoadingPositions || !formData.facilityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingPositions 
                      ? "Loading..." 
                      : !formData.facilityId 
                        ? "Select a facility first"
                        : "Select seller"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableSellers.map((cp) => (
                    <SelectItem key={cp.id} value={cp.id}>
                      {cp.name}
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
                disabled={isLoadingCounterparties}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCounterparties ? "Loading..." : "Select buyer"} />
                </SelectTrigger>
                <SelectContent>
                  {counterparties.map((cp) => (
                    <SelectItem key={cp.id} value={cp.id}>
                      {cp.name}
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