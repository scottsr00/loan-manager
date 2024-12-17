'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EntityWithRelations } from '@/server/actions/entity'
import { EntityDetailsModal } from './EntityDetailsModal'

export function EntityList({ entities }: { entities: EntityWithRelations[] }) {
  const [selectedEntity, setSelectedEntity] = useState<EntityWithRelations | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Legal Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Primary Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entities.map((entity) => {
            const primaryAddress = entity.addresses[0]
            const primaryContact = entity.contacts[0]
            
            return (
              <TableRow 
                key={entity.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  setSelectedEntity(entity)
                  setDetailsOpen(true)
                }}
              >
                <TableCell className="font-medium">
                  {entity.legalName}
                  {entity.dba && (
                    <div className="text-sm text-muted-foreground">
                      DBA: {entity.dba}
                    </div>
                  )}
                </TableCell>
                <TableCell>{entity.entityType.name}</TableCell>
                <TableCell>
                  <Badge variant={entity.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {entity.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {primaryContact ? (
                    <div>
                      <div>{`${primaryContact.firstName} ${primaryContact.lastName}`}</div>
                      {primaryContact.title && (
                        <div className="text-sm text-muted-foreground">
                          {primaryContact.title}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No primary contact</span>
                  )}
                </TableCell>
                <TableCell>
                  {primaryAddress ? (
                    <div>
                      <div>{primaryAddress.city}</div>
                      {primaryAddress.state && (
                        <div className="text-sm text-muted-foreground">
                          {primaryAddress.state}, {primaryAddress.country}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No primary address</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(entity.createdAt), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <EntityDetailsModal 
        entity={selectedEntity}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  )
} 