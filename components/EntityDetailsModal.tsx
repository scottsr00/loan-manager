'use client'

import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { EntityWithRelations } from '@/app/actions/getEntities'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

interface EntityDetailsModalProps {
  entity: EntityWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntityDetailsModal({ entity, open, onOpenChange }: EntityDetailsModalProps) {
  if (!entity) return null

  const [canScroll, setCanScroll] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkScroll = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight } = contentRef.current
        setCanScroll(scrollHeight > clientHeight)
      }
    }

    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [entity])

  const primaryAddress = entity.addresses[0]
  const primaryContact = entity.contacts[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{entity.legalName}</span>
            <Badge variant={entity.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {entity.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <ScrollArea 
            className="h-[calc(80vh-8rem)] pr-4"
            ref={contentRef}
          >
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Entity Type</Label>
                    <div>{entity.entityType.name}</div>
                  </div>
                  {entity.dba && (
                    <div>
                      <Label className="text-muted-foreground">DBA</Label>
                      <div>{entity.dba}</div>
                    </div>
                  )}
                  {entity.registrationNumber && (
                    <div>
                      <Label className="text-muted-foreground">Registration Number</Label>
                      <div>{entity.registrationNumber}</div>
                    </div>
                  )}
                  {entity.taxId && (
                    <div>
                      <Label className="text-muted-foreground">Tax ID</Label>
                      <div>{entity.taxId}</div>
                    </div>
                  )}
                  {entity.incorporationDate && (
                    <div>
                      <Label className="text-muted-foreground">Incorporation Date</Label>
                      <div>{format(new Date(entity.incorporationDate), 'PPP')}</div>
                    </div>
                  )}
                  {entity.website && (
                    <div>
                      <Label className="text-muted-foreground">Website</Label>
                      <div>
                        <a 
                          href={entity.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {entity.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                {entity.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <div>{entity.description}</div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Primary Address */}
              {primaryAddress && (
                <div className="space-y-4">
                  <h4 className="font-medium">Primary Address</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Type</Label>
                      <div>{primaryAddress.type}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Street</Label>
                      <div>{primaryAddress.street1}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">City</Label>
                      <div>{primaryAddress.city}</div>
                    </div>
                    {primaryAddress.state && (
                      <div>
                        <Label className="text-muted-foreground">State</Label>
                        <div>{primaryAddress.state}</div>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Country</Label>
                      <div>{primaryAddress.country}</div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Primary Contact */}
              {primaryContact && (
                <div className="space-y-4">
                  <h4 className="font-medium">Primary Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <div>{`${primaryContact.firstName} ${primaryContact.lastName}`}</div>
                    </div>
                    {primaryContact.title && (
                      <div>
                        <Label className="text-muted-foreground">Title</Label>
                        <div>{primaryContact.title}</div>
                      </div>
                    )}
                    {primaryContact.email && (
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <div>
                          <a 
                            href={`mailto:${primaryContact.email}`}
                            className="text-blue-500 hover:underline"
                          >
                            {primaryContact.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Metadata */}
              <div className="space-y-4">
                <h4 className="font-medium">Metadata</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <div>{format(new Date(entity.createdAt), 'PPP')}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <div>{format(new Date(entity.updatedAt), 'PPP')}</div>
                  </div>
                </div>
              </div>
            </div>
            <ScrollBar />
          </ScrollArea>
          {canScroll && (
            <div className="absolute bottom-0 left-0 right-4 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 