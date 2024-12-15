'use client'

import { useState } from 'react'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCounterparty } from '@/app/actions/createCounterparty'
import { CounterpartyType } from '@/app/actions/getCounterpartyTypes'
import { toast } from 'sonner'

// Helper component for required field label
function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      {children}
      <span className="text-destructive">*</span>
    </div>
  )
}

const counterpartyFormSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  parentName: z.string().optional(),
  ultParentName: z.string().optional(),
  counterpartyTypeId: z.string().min(1, 'Counterparty type is required'),
  kycStatus: z.string().min(1, 'KYC status is required'),
  onboardingStatus: z.string().min(1, 'Onboarding status is required'),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  address: z.object({
    type: z.string().min(1, 'Address type is required'),
    street1: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    isPrimary: z.boolean().default(true),
  }),
  contact: z.object({
    type: z.string().min(1, 'Contact type is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    title: z.string().optional(),
    email: z.string().email('Must be a valid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    isPrimary: z.boolean().default(true),
  }),
})

type CounterpartyFormValues = z.infer<typeof counterpartyFormSchema>

interface CounterpartyType {
  id: string
  name: string
  description: string | null
}

const COUNTERPARTY_TYPES: CounterpartyType[] = [
  { id: 'bank', name: 'Bank', description: 'Banking institution' },
  { id: 'broker', name: 'Broker', description: 'Brokerage firm' },
  { id: 'fund', name: 'Fund', description: 'Investment fund' },
  { id: 'corporate', name: 'Corporate', description: 'Corporate entity' },
]

interface NewCounterpartyModalProps {
  onCounterpartyCreated: () => void
}

export function NewCounterpartyModal({
  onCounterpartyCreated,
}: NewCounterpartyModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  const form = useForm<CounterpartyFormValues>({
    resolver: zodResolver(counterpartyFormSchema),
    defaultValues: {
      kycStatus: 'PENDING',
      onboardingStatus: 'NEW',
      address: {
        type: 'REGISTERED',
        isPrimary: true,
      },
      contact: {
        type: 'OFFICER',
        isPrimary: true,
      },
    },
    mode: 'onChange',
  })

  async function onSubmit(data: CounterpartyFormValues) {
    if (isSubmitting) return
    setIsSubmitting(true)
    setFormError(null)
    
    try {
      if (!data.counterpartyTypeId) {
        throw new Error('Please select a counterparty type')
      }

      const formData = {
        ...data,
        address: {
          ...data.address,
          type: 'REGISTERED',
          isPrimary: true,
        },
        contact: {
          ...data.contact,
          type: 'OFFICER',
          isPrimary: true,
        },
      }
      
      const result = await createCounterparty(formData)
      
      if (!result) {
        throw new Error('Failed to create counterparty')
      }

      toast.success('Counterparty created successfully')
      setOpen(false)
      form.reset()
      onCounterpartyCreated()
    } catch (error) {
      console.error('Error creating counterparty:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create counterparty'
      setFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        form.reset()
        setFormError(null)
      }
    }}>
      <DialogTrigger asChild>
        <Button>Add Counterparty</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Counterparty</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Fields marked with <span className="text-destructive">*</span> are required
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {formError && (
              <div className="rounded-md bg-destructive/15 p-3">
                <div className="text-sm text-destructive">{formError}</div>
              </div>
            )}
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Legal Name</FormLabel>
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
                  name="counterpartyTypeId"
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
                          {COUNTERPARTY_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
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
                  name="kycStatus"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>KYC Status</FormLabel>
                      </RequiredLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="onboardingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Onboarding Status</FormLabel>
                      </RequiredLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Primary Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.street1"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Street Address</FormLabel>
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
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>City</FormLabel>
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
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>Optional</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Country</FormLabel>
                      </RequiredLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Primary Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact.firstName"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>First Name</FormLabel>
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
                  name="contact.lastName"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>
                        <FormLabel>Last Name</FormLabel>
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
                  name="contact.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>Optional</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>Optional</FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setOpen(false)
                  form.reset()
                  setFormError(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? 'Creating...' : 'Create Counterparty'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 