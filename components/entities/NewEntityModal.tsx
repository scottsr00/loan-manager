'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createEntity } from '@/server/actions/entity'
import { getEntityTypes } from '@/server/actions/entity'
import type { CounterpartyType } from '@/types/counterparty'
import { DatePicker } from '@/components/ui/date-picker'

export function NewEntityModal({
  onEntityCreated,
}: {
  onEntityCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [entityTypes, setEntityTypes] = useState<CounterpartyType[]>([])
  const [date, setDate] = useState<Date>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadEntityTypes()
    }
  }, [open])

  const loadEntityTypes = async () => {
    try {
      const types = await getEntityTypes()
      setEntityTypes(types)
    } catch (error) {
      console.error('Error loading entity types:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      await createEntity({
        legalName: formData.get('legalName') as string,
        dba: formData.get('dba') as string || undefined,
        registrationNumber: formData.get('registrationNumber') as string || undefined,
        taxId: formData.get('taxId') as string || undefined,
        status: 'ACTIVE',
        isAgent: formData.get('isAgent') === 'on',
        dateOfIncorporation: date,
        addresses: [{
          type: 'REGISTERED',
          street1: formData.get('street1') as string,
          street2: formData.get('street2') as string || undefined,
          city: formData.get('city') as string,
          state: formData.get('state') as string || undefined,
          postalCode: formData.get('postalCode') as string || undefined,
          country: formData.get('country') as string,
          isPrimary: true,
        }],
        contacts: [{
          type: 'OFFICER',
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          title: formData.get('title') as string || undefined,
          email: formData.get('email') as string || undefined,
          phone: formData.get('phone') as string || undefined,
          isPrimary: true,
        }],
        primaryContactName: `${formData.get('firstName')} ${formData.get('lastName')}`,
        primaryContactEmail: formData.get('email') as string || undefined,
        primaryContactPhone: formData.get('phone') as string || undefined,
      })

      setOpen(false)
      onEntityCreated()
    } catch (error) {
      console.error('Error creating entity:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Entity</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Entity</DialogTitle>
          <DialogDescription>
            Enter the details of the new entity. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legalName">Legal Name *</Label>
                <Input id="legalName" name="legalName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dba">DBA</Label>
                <Input id="dba" name="dba" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input id="registrationNumber" name="registrationNumber" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input id="taxId" name="taxId" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entityTypeId">Entity Type *</Label>
                <Select name="entityTypeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Incorporation Date</Label>
                <DatePicker value={date} onChange={setDate} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAgent"
                name="isAgent"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isAgent">Is Agent Bank</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" type="url" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Primary Address</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street1">Street Address *</Label>
                  <Input id="street1" name="street1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street2">Street Address 2</Label>
                  <Input id="street2" name="street2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" name="postalCode" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" name="country" required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Primary Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Entity'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 