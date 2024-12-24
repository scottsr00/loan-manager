'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import type { Borrower } from '@/types/borrower'
import { createBorrower } from '@/server/actions/borrower/createBorrower'
import { updateBorrower } from '@/server/actions/borrower/updateBorrower'

const formSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  dba: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  countryOfIncorporation: z.string().optional(),
  industrySegment: z.string().min(1, 'Industry segment is required'),
  businessType: z.string().min(1, 'Business type is required'),
  creditRating: z.string().optional(),
  ratingAgency: z.string().optional(),
  riskRating: z.string().optional(),
  onboardingStatus: z.string().default('PENDING'),
  kycStatus: z.string().default('PENDING')
})

export interface BorrowerModalProps {
  open: boolean
  onClose: () => void
  borrower?: Borrower | null
}

export function BorrowerModal({ open, onClose, borrower }: BorrowerModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legalName: '',
      dba: '',
      registrationNumber: '',
      taxId: '',
      countryOfIncorporation: '',
      industrySegment: '',
      businessType: '',
      creditRating: '',
      ratingAgency: '',
      riskRating: '',
      onboardingStatus: 'PENDING',
      kycStatus: 'PENDING'
    }
  })

  useEffect(() => {
    if (borrower) {
      setIsEditing(true)
      form.reset({
        legalName: borrower.entity.legalName,
        dba: borrower.entity.dba || '',
        registrationNumber: borrower.entity.registrationNumber || '',
        taxId: borrower.entity.taxId || '',
        countryOfIncorporation: borrower.entity.countryOfIncorporation || '',
        industrySegment: borrower.industrySegment || '',
        businessType: borrower.businessType || '',
        creditRating: borrower.creditRating || '',
        ratingAgency: borrower.ratingAgency || '',
        riskRating: borrower.riskRating || '',
        onboardingStatus: borrower.onboardingStatus || 'PENDING',
        kycStatus: borrower.kycStatus || 'PENDING'
      })
    } else {
      setIsEditing(false)
      form.reset({
        legalName: '',
        dba: '',
        registrationNumber: '',
        taxId: '',
        countryOfIncorporation: '',
        industrySegment: '',
        businessType: '',
        creditRating: '',
        ratingAgency: '',
        riskRating: '',
        onboardingStatus: 'PENDING',
        kycStatus: 'PENDING'
      })
    }
  }, [borrower, form])

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      if (isEditing && borrower) {
        await updateBorrower(borrower.id, data)
      } else {
        await createBorrower(data)
      }
      onClose()
      router.refresh()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to save borrower', {
        description: 'Please try again or contact support if the issue persists.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Borrower' : 'Create Borrower'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh] pr-4">
              <Tabs defaultValue="business" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="business">Business Info</TabsTrigger>
                  <TabsTrigger value="risk">Risk & Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="business" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Acme Corporation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dba"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DBA</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 12-3456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="countryOfIncorporation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Incorporation</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industrySegment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry Segment</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Technology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Corporation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="risk" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="creditRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Rating</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., AAA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ratingAgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating Agency</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., S&P" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="riskRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Rating</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Low" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="onboardingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Onboarding Status</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., PENDING" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="kycStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>KYC Status</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., PENDING" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 