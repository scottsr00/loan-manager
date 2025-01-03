'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createCreditAgreement } from '@/server/actions/loan/createCreditAgreement'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { FacilityFormDialog } from '@/components/facilities/FacilityFormDialog'
import { type EntityWithRelations } from '@/server/types/entity'
import { creditAgreementInputSchema, facilityInputSchema, type CreditAgreementWithRelations } from '@/server/types/credit-agreement'
import { useBorrowers } from '@/hooks/useBorrowers'
import { useLenders } from '@/hooks/useLenders'

type CreditAgreementFormValues = z.infer<typeof creditAgreementInputSchema>
type FacilityFormValues = z.infer<typeof facilityInputSchema>

interface NewCreditAgreementModalProps {
  onCreditAgreementCreated: (creditAgreement: CreditAgreementWithRelations) => void
}

// Helper component for required field label
function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      {children}
      <span className="text-destructive">*</span>
    </div>
  )
}

export function NewCreditAgreementModal({
  onCreditAgreementCreated,
}: NewCreditAgreementModalProps) {
  const [open, setOpen] = useState(false)
  const [isFacilityDialogOpen, setIsFacilityDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [facilities, setFacilities] = useState<FacilityFormValues[]>([])
  const { borrowers, isLoading: isLoadingBorrowers } = useBorrowers()
  const { lenders, isLoading: isLoadingLenders } = useLenders()

  const form = useForm<CreditAgreementFormValues>({
    resolver: zodResolver(creditAgreementInputSchema),
    defaultValues: {
      status: 'ACTIVE',
      currency: 'USD',
      startDate: new Date(),
      maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
      facilities: [],
    },
  })

  async function onSubmit(data: CreditAgreementFormValues) {
    if (isSubmitting) return
    setIsSubmitting(true)
    setFormError(null)
    
    try {
      const result = await createCreditAgreement({
        ...data,
        facilities: facilities,
      })
      
      toast.success('Credit agreement created successfully')
      setOpen(false)
      form.reset()
      setFacilities([])
      onCreditAgreementCreated(result)
    } catch (error) {
      console.error('Error creating credit agreement:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create credit agreement'
      setFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddFacility = (facility: FacilityFormValues) => {
    setFacilities(prev => [...prev, facility])
  }

  const removeFacility = (index: number) => {
    setFacilities(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          form.reset()
          setFacilities([])
          setFormError(null)
        }
      }}>
        <DialogTrigger asChild>
          <Button>Add Credit Agreement</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Credit Agreement</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {formError && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <div className="text-sm text-destructive">{formError}</div>
                </div>
              )}
              
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="agreementNumber"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Agreement Number</FormLabel>
                        </RequiredLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., CA-2024-001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="borrowerId"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Borrower</FormLabel>
                        </RequiredLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingBorrowers}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingBorrowers ? "Loading..." : "Select borrower"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {borrowers.map(borrower => (
                              <SelectItem key={borrower.id} value={borrower.entity.id}>
                                {borrower.entity.legalName}
                                {borrower.entity.dba && ` (${borrower.entity.dba})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lenderId"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Lender</FormLabel>
                        </RequiredLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingLenders}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingLenders ? "Loading..." : "Select lender"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lenders.map(lender => (
                              <SelectItem key={lender.id} value={lender.entity.id}>
                                {lender.entity.legalName}
                                {lender.entity.dba && ` (${lender.entity.dba})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Status</FormLabel>
                        </RequiredLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="TERMINATED">Terminated</SelectItem>
                            <SelectItem value="DEFAULTED">Defaulted</SelectItem>
                            <SelectItem value="MATURED">Matured</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Amount</FormLabel>
                        </RequiredLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => onChange(parseFloat(e.target.value))}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Currency</FormLabel>
                        </RequiredLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Start Date</FormLabel>
                        </RequiredLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maturityDate"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Maturity Date</FormLabel>
                        </RequiredLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Interest Rate (%)</FormLabel>
                        </RequiredLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Facilities */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Facilities</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFacilityDialogOpen(true)}
                  >
                    Add Facility
                  </Button>
                </CardHeader>
                <CardContent>
                  {facilities.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No facilities added yet. Click the button above to add one.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {facilities.map((facility, index) => (
                        <Card key={index}>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">{facility.facilityName}</CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFacility(index)}
                            >
                              Remove
                            </Button>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Type</label>
                              <p>{facility.facilityType}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Amount</label>
                              <p>{`${facility.commitmentAmount} ${facility.currency}`}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Interest</label>
                              <p>{`${facility.interestType} (${facility.baseRate} + ${facility.margin}%)`}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || facilities.length === 0}
                >
                  {isSubmitting ? 'Creating...' : 'Create Credit Agreement'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <FacilityFormDialog
        open={isFacilityDialogOpen}
        onOpenChange={setIsFacilityDialogOpen}
        onSubmit={handleAddFacility}
        defaultStartDate={form.getValues('startDate')}
        defaultMaturityDate={form.getValues('maturityDate')}
        defaultCommitmentAmount={form.getValues('amount')}
      />
    </>
  )
} 