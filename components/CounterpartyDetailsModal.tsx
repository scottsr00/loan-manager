'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Counterparty } from '@/types/counterparty'

interface CounterpartyDetailsModalProps {
  counterparty: Counterparty | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CounterpartyDetailsModal({
  counterparty,
  open,
  onOpenChange,
}: CounterpartyDetailsModalProps) {
  if (!counterparty) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-4">
            {counterparty.legalName}
            <Badge variant={counterparty.status === 'ACTIVE' ? 'success' : 'warning'}>
              {counterparty.status}
            </Badge>
          </DialogTitle>
          {counterparty.dba && (
            <p className="text-muted-foreground">DBA: {counterparty.dba}</p>
          )}
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p>{counterparty.type.name}</p>
              </div>
              {counterparty.registrationNumber && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                  <p>{counterparty.registrationNumber}</p>
                </div>
              )}
              {counterparty.taxId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tax ID</p>
                  <p>{counterparty.taxId}</p>
                </div>
              )}
              {counterparty.incorporationDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Incorporation Date</p>
                  <p>{format(new Date(counterparty.incorporationDate), 'MMM d, yyyy')}</p>
                </div>
              )}
              {counterparty.website && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <a 
                    href={counterparty.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {counterparty.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {counterparty.addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{address.type}</h4>
                    {address.isPrimary && (
                      <Badge variant="outline">Primary</Badge>
                    )}
                  </div>
                  <p>{address.street1}</p>
                  {address.street2 && <p>{address.street2}</p>}
                  <p>
                    {[
                      address.city,
                      address.state,
                      address.postalCode
                    ].filter(Boolean).join(', ')}
                  </p>
                  <p>{address.country}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {counterparty.contacts.map((contact) => (
                <div key={contact.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{contact.type}</h4>
                    {contact.isPrimary && (
                      <Badge variant="outline">Primary</Badge>
                    )}
                  </div>
                  <p className="font-medium">
                    {contact.firstName} {contact.lastName}
                  </p>
                  {contact.title && (
                    <p className="text-muted-foreground">{contact.title}</p>
                  )}
                  {contact.email && (
                    <p>
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-primary hover:underline"
                      >
                        {contact.email}
                      </a>
                    </p>
                  )}
                  {contact.phone && <p>{contact.phone}</p>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Description */}
          {counterparty.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{counterparty.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 