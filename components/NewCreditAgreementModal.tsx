'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCreditAgreement } from '@/app/actions/createCreditAgreement'
import { CreditAgreementWithRelations } from '@/app/actions/getCreditAgreements'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FacilityFormDialog } from '@/components/FacilityFormDialog'
import { getEntities, EntityWithRelations } from '@/app/actions/getEntities'

// Helper component for required field label
function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      {children}
      <span className="text-destructive">*</span>
    </div>
  )
}

const facilitySchema = z.object({
  facilityName: z.string().min(1, 'Facility name is required'),
  facilityType: z.string().min(1, 'Facility type is required'),
  commitmentAmount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  startDate: z.date(),
  maturityDate: z.date(),
  interestType: z.string().min(1, 'Interest type is required'),
  baseRate: z.string().min(1, 'Base rate is required'),
  margin: z.number().min(0, 'Margin must be positive'),
  description: z.string().optional(),
})

const creditAgreementFormSchema = z.object({
  agreementName: z.string().min(1, 'Agreement name is required'),
  agreementNumber: z.string().min(1, 'Agreement number is required'),
  borrowerId: z.string().min(1, 'Borrower is required'),
  agentBankId: z.string().min(1, 'Agent bank is required'),
  status: z.string().min(1, 'Status is required'),
  effectiveDate: z.date(),
  maturityDate: z.date(),
  totalAmount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  description: z.string().optional(),
  facilities: z.array(facilitySchema).min(1, 'At least one facility is required'),
})

type CreditAgreementFormValues = z.infer<typeof creditAgreementFormSchema>

interface NewCreditAgreementModalProps {
  onCreditAgreementCreated: (creditAgreement: CreditAgreementWithRelations) => void
}

export function NewCreditAgreementModal({
  onCreditAgreementCreated,
}: NewCreditAgreementModalProps) {
  const [open, setOpen] = useState(false)
  const [isFacilityDialogOpen, setIsFacilityDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [facilities, setFacilities] = useState<z.infer<typeof facilitySchema>[]>([])
  const [entities, setEntities] = useState<EntityWithRelations[]>([])
  
  // Load entities on mount
  useEffect(() => {
    const loadEntities = async () => {
      try {
        const loadedEntities = await getEntities()
        setEntities(loadedEntities)
      } catch (error) {
        console.error('Error loading entities:', error)
        toast.error('Failed to load entities')
      }
    }
    loadEntities()
  }, [])

  const bankEntities = entities.filter(entity => entity.entityType.name === 'Bank')
  const borrowerEntities = entities.filter(entity => entity.entityType.name === 'Corporate')

  const form = useForm<CreditAgreementFormValues>({
    resolver: zodResolver(creditAgreementFormSchema),
    defaultValues: {
      status: 'ACTIVE',
      currency: 'USD',
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

  const handleAddFacility = (facility: z.infer<typeof facilitySchema>) => {
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
                    name="agreementName"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Agreement Name</FormLabel>
                        </RequiredLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreementNumber"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Agreement Number</FormLabel>
                        </RequiredLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select borrower" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {borrowerEntities.map(entity => (
                              <SelectItem key={entity.id} value={entity.id}>
                                {entity.legalName}
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
                    name="agentBankId"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Agent Bank</FormLabel>
                        </RequiredLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select agent bank" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bankEntities.map(entity => (
                              <SelectItem key={entity.id} value={entity.id}>
                                {entity.legalName}
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
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredLabel>
                          <FormLabel>Total Amount</FormLabel>
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

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setOpen(false)
                    form.reset()
                    setFacilities([])
                    setFormError(null)
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || facilities.length === 0}>
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
      />
    </>
  )
} 