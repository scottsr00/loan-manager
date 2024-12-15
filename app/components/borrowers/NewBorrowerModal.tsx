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
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBorrowers } from '@/hooks/useBorrowers'
import { getBorrowerEntities } from '@/app/actions/getBorrowerEntities'
import { useEffect } from 'react'

const formSchema = z.object({
  entityId: z.string().min(1, "Entity is required"),
  creditRating: z.string().optional(),
  ratingAgency: z.string().optional(),
  industrySegment: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Entity {
  id: string
  legalName: string
}

export function NewBorrowerModal({
  children,
  onBorrowerCreated
}: {
  children: React.ReactNode
  onBorrowerCreated?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [entities, setEntities] = useState<Entity[]>([])
  const { create } = useBorrowers()

  useEffect(() => {
    const loadEntities = async () => {
      try {
        const data = await getBorrowerEntities()
        setEntities(data)
      } catch (error) {
        console.error('Error loading entities:', error)
      }
    }
    loadEntities()
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entityId: "",
      creditRating: "",
      ratingAgency: "",
      industrySegment: "",
    },
  })

  const handleSubmit = async (data: FormValues) => {
    try {
      await create(data)
      setOpen(false)
      form.reset()
      onBorrowerCreated?.()
    } catch (error) {
      console.error('Error creating borrower:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Borrower</DialogTitle>
          <DialogDescription>
            Select an entity to create a new borrower profile.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="entityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an entity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entities.map((entity) => (
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
              name="creditRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Rating</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BBB+" {...field} />
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