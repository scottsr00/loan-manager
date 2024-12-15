import { prisma } from '@/lib/prisma'
import { EntityWithRelations } from '@/types/entity'

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
    throw new Error('Failed to fetch entities')
  }
}

export async function getEntityById(id: string): Promise<EntityWithRelations | null> {
  try {
    const entity = await prisma.entity.findUnique({
      where: { id },
      include: {
        entityType: {
          select: {
            name: true,
          },
        },
        addresses: true,
        contacts: true,
      },
    })
    return entity
  } catch (error) {
    console.error('Error in getEntityById:', error)
    throw new Error('Failed to fetch entity')
  }
}

export async function createEntity(data: any): Promise<EntityWithRelations> {
  try {
    const entity = await prisma.entity.create({
      data: {
        ...data,
        addresses: {
          create: data.addresses,
        },
        contacts: {
          create: data.contacts,
        },
      },
      include: {
        entityType: {
          select: {
            name: true,
          },
        },
        addresses: true,
        contacts: true,
      },
    })
    return entity
  } catch (error) {
    console.error('Error in createEntity:', error)
    throw new Error('Failed to create entity')
  }
}

export async function updateEntity(id: string, data: any): Promise<EntityWithRelations> {
  try {
    const entity = await prisma.entity.update({
      where: { id },
      data: {
        ...data,
        addresses: {
          upsert: data.addresses?.map((address: any) => ({
            where: { id: address.id || 'new' },
            create: address,
            update: address,
          })),
        },
        contacts: {
          upsert: data.contacts?.map((contact: any) => ({
            where: { id: contact.id || 'new' },
            create: contact,
            update: contact,
          })),
        },
      },
      include: {
        entityType: {
          select: {
            name: true,
          },
        },
        addresses: true,
        contacts: true,
      },
    })
    return entity
  } catch (error) {
    console.error('Error in updateEntity:', error)
    throw new Error('Failed to update entity')
  }
}

export async function deleteEntity(id: string): Promise<void> {
  try {
    await prisma.entity.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Error in deleteEntity:', error)
    throw new Error('Failed to delete entity')
  }
}

export async function getEntityTypes() {
  try {
    const entityTypes = await prisma.entityType.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return entityTypes
  } catch (error) {
    console.error('Error in getEntityTypes:', error)
    throw new Error('Failed to fetch entity types')
  }
}

export async function getBankEntities(): Promise<EntityWithRelations[]> {
  try {
    const bankEntities = await prisma.entity.findMany({
      where: {
        entityType: {
          name: 'Bank',
        },
      },
      include: {
        entityType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        legalName: 'asc',
      },
    })
    return bankEntities
  } catch (error) {
    console.error('Error in getBankEntities:', error)
    throw new Error('Failed to fetch bank entities')
  }
}

export async function getBorrowerEntities(): Promise<EntityWithRelations[]> {
  try {
    const borrowerEntities = await prisma.entity.findMany({
      where: {
        entityType: {
          name: 'Borrower',
        },
      },
      include: {
        entityType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        legalName: 'asc',
      },
    })
    return borrowerEntities
  } catch (error) {
    console.error('Error in getBorrowerEntities:', error)
    throw new Error('Failed to fetch borrower entities')
  }
} 