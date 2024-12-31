'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { useBorrowers } from '@/hooks/useBorrowers'
import { updateCreditAgreement } from '@/server/actions/loan/updateCreditAgreement'
import { getCreditAgreement } from '@/server/actions/loan/getCreditAgreement'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type CreditAgreementWithRelations } from '@/server/types/credit-agreement'

interface CreditAgreementDetailsModalProps {
  creditAgreementId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

interface FormData {
  id: string
  agreementNumber?: string
  borrowerId?: string
  status?: string
  amount?: number
  currency?: string
  startDate?: Date
  maturityDate?: Date
  interestRate?: number
  description?: string | null
}

export function CreditAgreementDetailsModal({
  creditAgreementId,
  open,
  onOpenChange,
  onUpdate,
}: CreditAgreementDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { borrowers = [], isLoading: isLoadingBorrowers } = useBorrowers()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [creditAgreement, setCreditAgreement] = useState<CreditAgreementWithRelations | null>(null)

  useEffect(() => {
    if (!open) {
      setIsEditing(false)
      setIsSubmitting(false)
      setFormData(null)
      setCreditAgreement(null)
      setIsLoading(true)
    }
  }, [open])

  useEffect(() => {
    if (open && creditAgreementId) {
      console.log('Fetching credit agreement with ID:', creditAgreementId)
      setIsLoading(true)
      getCreditAgreement(creditAgreementId)
        .then(data => {
          console.log('Received credit agreement data:', data)
          setCreditAgreement(data)
          setIsLoading(false)
        })
        .catch(error => {
          console.error('Error loading credit agreement:', error)
          setIsLoading(false)
        })
    }
  }, [creditAgreementId, open])

  const handleEdit = () => {
    if (!creditAgreement) return
    setFormData({
      id: creditAgreement.id,
      agreementNumber: creditAgreement.agreementNumber,
      borrowerId: creditAgreement.borrowerId,
      status: creditAgreement.status,
      amount: creditAgreement.amount,
      currency: creditAgreement.currency,
      startDate: new Date(creditAgreement.startDate),
      maturityDate: new Date(creditAgreement.maturityDate),
      interestRate: creditAgreement.interestRate,
      description: creditAgreement.description,
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData(null)
  }

  const handleSave = async () => {
    if (!formData) return
    setIsSubmitting(true)
    try {
      const updateData = {
        ...formData,
        description: formData.description || undefined
      }
      await updateCreditAgreement(updateData)
      toast.success('Credit agreement updated successfully')
      setIsEditing(false)
      setFormData(null)
      onOpenChange(false)
      onUpdate?.()
    } catch (error) {
      console.error('Error updating credit agreement:', error)
      toast.error('Failed to update credit agreement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    if (!formData) return
    setFormData({
      ...formData,
      [field]: value
    } as FormData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-2xl">
                {isLoading ? (
                  'Loading...'
                ) : !creditAgreement ? (
                  'Credit Agreement Not Found'
                ) : isEditing ? (
                  <Input
                    value={formData?.agreementNumber}
                    onChange={(e) => handleInputChange('agreementNumber', e.target.value)}
                    className="text-2xl font-semibold"
                  />
                ) : (
                  creditAgreement.agreementNumber
                )}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {!isLoading && creditAgreement && (isEditing ? (
                  <Select
                    value={formData?.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="TERMINATED">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={creditAgreement.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {creditAgreement.status}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {!isLoading && creditAgreement && (isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSubmitting}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>
                  Edit Agreement
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !creditAgreement ? (
          <div className="py-4 text-center text-muted-foreground">
            Credit agreement not found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Agreement Details */}
            <Card>
              <CardHeader>
                <CardTitle>Agreement Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label>Total Amount</Label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={formData?.amount}
                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <Select
                        value={formData?.currency}
                        onValueChange={(value) => handleInputChange('currency', value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <p>{formatCurrency(creditAgreement.amount)} {creditAgreement.currency}</p>
                  )}
                </div>
                <div>
                  <Label>Interest Rate</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData?.interestRate}
                      onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value))}
                      step="0.01"
                    />
                  ) : (
                    <p>{creditAgreement.interestRate}%</p>
                  )}
                </div>
                <div>
                  <Label>Start Date</Label>
                  {isEditing ? (
                    <DatePicker
                      value={formData?.startDate}
                      onChange={(date) => handleInputChange('startDate', date)}
                    />
                  ) : (
                    <p>{format(new Date(creditAgreement.startDate), 'PPP')}</p>
                  )}
                </div>
                <div>
                  <Label>Maturity Date</Label>
                  {isEditing ? (
                    <DatePicker
                      value={formData?.maturityDate}
                      onChange={(date) => handleInputChange('maturityDate', date)}
                    />
                  ) : (
                    <p>{format(new Date(creditAgreement.maturityDate), 'PPP')}</p>
                  )}
                </div>
                <div>
                  <Label>Description</Label>
                  {isEditing ? (
                    <Input
                      value={formData?.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  ) : (
                    creditAgreement.description && <p>{creditAgreement.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Borrower Information */}
            <Card>
              <CardHeader>
                <CardTitle>Borrower Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label>Borrower</Label>
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <Select
                        value={formData?.borrowerId || creditAgreement.borrowerId}
                        onValueChange={(value) =>
                          setFormData((prev) => prev ? { ...prev, borrowerId: value } : null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {borrowers.find((b) => b.id === creditAgreement.borrowerId)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {borrowers.map((borrower) => (
                            <SelectItem key={borrower.id} value={borrower.id}>
                              {borrower.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <>
                      <p>{creditAgreement.borrower?.name || 'N/A'}</p>
                      <div className="flex gap-2 mt-1">
                        {creditAgreement.borrower?.industrySegment && (
                          <Badge variant="outline">{creditAgreement.borrower.industrySegment}</Badge>
                        )}
                        <Badge variant={creditAgreement.borrower?.onboardingStatus === 'ACTIVE' ? 'success' : 'secondary'}>
                          {creditAgreement.borrower?.onboardingStatus || 'N/A'}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lender Information */}
            <Card>
              <CardHeader>
                <CardTitle>Lender Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label>Name</Label>
                  <p>{creditAgreement.lender?.legalName || 'N/A'}</p>
                  <div className="flex gap-2 mt-1">
                    {creditAgreement.lender?.dba && (
                      <Badge variant="outline">{creditAgreement.lender.dba}</Badge>
                    )}
                    <Badge variant={creditAgreement.lender?.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {creditAgreement.lender?.status || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                {creditAgreement.facilities.length > 0 ? (
                  <div className="space-y-4">
                    {creditAgreement.facilities.map((facility) => (
                      <div key={facility.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{facility.facilityName}</h4>
                            <Badge variant="outline" className="mt-1">
                              {facility.facilityType}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(facility.commitmentAmount)} {facility.currency}</p>
                            <p className="text-sm text-muted-foreground">
                              {facility.baseRate} + {facility.margin}%
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Start Date:</span>
                            <p>{format(new Date(facility.startDate), 'PP')}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Maturity Date:</span>
                            <p>{format(new Date(facility.maturityDate), 'PP')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No facilities have been added to this agreement.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 