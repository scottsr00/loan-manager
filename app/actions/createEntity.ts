'use server'

import { prisma } from '@/lib/prisma'

export type CreateEntityInput = {
  legalName: string
  dba?: string
  registrationNumber?: string
  taxId?: string
  entityTypeId: string
  status: string
  incorporationDate?: Date
  website?: string
  description?: string
  address: {
    type: string
    street1: string
    street2?: string
    city: string
    state?: string
    postalCode?: string
    country: string
    isPrimary: boolean
  }
  contact: {
    type: string
    firstName: string
    lastName: string
    title?: string
    email?: string
    phone?: string
    isPrimary: boolean
  }
}

export async function createEntity(data: CreateEntityInput) {
  try {
    const entity = await prisma.entity.create({
      data: {
        legalName: data.legalName,
        dba: data.dba || null,
        registrationNumber: data.registrationNumber || null,
        taxId: data.taxId || null,
        entityTypeId: data.entityTypeId,
        status: data.status,
        incorporationDate: data.incorporationDate || null,
        website: data.website || null,
        description: data.description || null,
        addresses: {
          create: [data.address],
        },
        contacts: {
          create: [data.contact],
        },
      },
      include: {
        entityType: true,
        addresses: true,
        contacts: true,
      },
    })

    return entity
  } catch (error) {
    console.error('Error in createEntity:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to create entity: ${error.message}`)
    }
    throw new Error('Failed to create entity: Unknown error')
  }
} 