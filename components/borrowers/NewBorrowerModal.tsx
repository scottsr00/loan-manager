"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useBorrowers } from '@/hooks/useBorrowers'

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  industry: z.string().min(1, "Industry is required"),
})

export function NewBorrowerModal({
  children,
  onBorrowerCreated
}: {
  children: React.ReactNode
  onBorrowerCreated?: () => void
}) {
  const [open, setOpen] = useState(false)
  const { create } = useBorrowers()

  const handleSubmit = async (data: any) => {
    try {
      await create(data)
      setOpen(false)
      onBorrowerCreated?.()
    } catch (error) {
      console.error('Error creating borrower:', error)
      throw error
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      taxId: "",
      jurisdiction: "",
      industry: "",
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Borrower</DialogTitle>
          <DialogDescription>
            Enter the details for the new borrower.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter borrower name" {...field} />
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
                    <Input placeholder="Enter tax ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jurisdiction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jurisdiction</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter jurisdiction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter industry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Borrower
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 