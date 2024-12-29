'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Card, CardContent } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'

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

type FacilityFormValues = z.infer<typeof facilitySchema>

interface FacilityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FacilityFormValues) => void
}

export function FacilityFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: FacilityFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  const form = useForm<FacilityFormValues>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      currency: 'USD',
      interestType: 'FLOATING',
      baseRate: 'SOFR',
      margin: 0,
    },
  })

  const handleSubmit = async (data: FacilityFormValues) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setFormError(null)
    
    try {
      onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting facility:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add facility'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen)
      if (!newOpen) {
        form.reset()
        setFormError(null)
      }
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Facility</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {formError && (
              <div className="rounded-md bg-destructive/15 p-3">
                <div className="text-sm text-destructive">{formError}</div>
              </div>
            )}
            
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 pt-6">
                <FormField
                  control={form.control}
                  name="facilityName"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Facility Name</FormLabel>
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
                  name="facilityType"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Type</FormLabel>
                      </RequiredLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="REVOLVING">Revolving</SelectItem>
                          <SelectItem value="TERM">Term</SelectItem>
                          <SelectItem value="DELAYED_DRAW">Delayed Draw</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commitmentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Commitment Amount</FormLabel>
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
                  name="interestType"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Interest Type</FormLabel>
                      </RequiredLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FIXED">Fixed</SelectItem>
                          <SelectItem value="FLOATING">Floating</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseRate"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Base Rate</FormLabel>
                      </RequiredLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SOFR">SOFR</SelectItem>
                          <SelectItem value="PRIME">Prime</SelectItem>
                          <SelectItem value="EURIBOR">EURIBOR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="margin"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Margin (%)</FormLabel>
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
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  onOpenChange(false)
                  form.reset()
                  setFormError(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Facility'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 