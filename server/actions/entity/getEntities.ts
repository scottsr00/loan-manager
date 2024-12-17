'use server'

import { prisma } from '@/server/db/client'
import { type EntityWithRelations } from '@/server/types'

export async function getEntities(): Promise<EntityWithRelations[]> {
  try {
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
        createdAt: 'desc'
      }
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