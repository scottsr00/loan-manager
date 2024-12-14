import { prisma } from '@/lib/prisma'

export type EntityWithRelations = {
  id: string
  legalName: string
  dba: string | null
  registrationNumber: string | null
  taxId: string | null
  status: string
  incorporationDate: Date | null
  website: string | null
  description: string | null
  entityType: {
    name: string
  }
  addresses: {
    type: string
    street1: string
    city: string
    state: string | null
    country: string
    isPrimary: boolean
  }[]
  contacts: {
    firstName: string
    lastName: string
    title: string | null
    email: string | null
    isPrimary: boolean
  }[]
  createdAt: Date
  updatedAt: Date
}

export async function getEntities(): Promise<EntityWithRelations[]> {
  try {
    const entities = await prisma.entity.findMany({
      include: {
        entityType: {
          select: {
            name: true,
          },
        },
        addresses: {
          where: {
            isPrimary: true,
          },
          select: {
            type: true,
            street1: true,
            city: true,
            state: true,
            country: true,
            isPrimary: true,
          },
        },
        contacts: {
          where: {
            isPrimary: true,
          },
          select: {
            firstName: true,
            lastName: true,
            title: true,
            email: true,
            isPrimary: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return entities
  } catch (error) {
    console.error('Error in getEntities:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch entities: ${error.message}`)
    }
    throw new Error('Failed to fetch entities: Unknown error')
  }
} 