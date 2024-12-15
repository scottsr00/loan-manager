'use server'

import { prisma } from '@/lib/prisma'
import type { Counterparty } from '@/types/counterparty'

export async function getCounterparties(): Promise<Counterparty[]> {
  const entities = await prisma.entity.findMany({
    include: {
      entityType: true,
      addresses: {
        where: {
          isPrimary: true
        }
      },
      contacts: {
        where: {
          isPrimary: true
        }
      }
    },
    orderBy: {
      legalName: 'asc'
    }
  })

  return entities.map(entity => ({
    id: entity.id,
    legalName: entity.legalName,
    parentName: entity.dba || undefined,
    ultParentName: undefined,
    counterpartyType: {
      id: entity.entityTypeId,
      name: entity.entityType.name
    },
    kycStatus: 'PENDING',
    onboardingStatus: entity.status,
    registrationNumber: entity.registrationNumber || undefined,
    taxId: entity.taxId || undefined,
    website: entity.website || undefined,
    description: entity.description || undefined,
    addresses: entity.addresses.map(address => ({
      id: address.id,
      type: address.type,
      street1: address.street1,
      street2: address.street2 || undefined,
      city: address.city,
      state: address.state || undefined,
      postalCode: address.postalCode || undefined,
      country: address.country,
      isPrimary: address.isPrimary
    })),
    contacts: entity.contacts.map(contact => ({
      id: contact.id,
      type: contact.type,
      firstName: contact.firstName,
      lastName: contact.lastName,
      title: contact.title || undefined,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      isPrimary: contact.isPrimary
    })),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt
  }))
} 