'use server'

import { prisma } from '@/lib/prisma'

export type EntityType = {
  id: string
  name: string
  description: string | null
}

export async function getEntityTypes(): Promise<EntityType[]> {
  try {
    const types = await prisma.entityType.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return types
  } catch (error) {
    console.error('Error in getEntityTypes:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch entity types: ${error.message}`)
    }
    throw new Error('Failed to fetch entity types: Unknown error')
  }
} 