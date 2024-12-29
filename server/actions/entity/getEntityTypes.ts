'use server'

import { prisma } from '@/server/db/client'

export async function getEntityTypes() {
  try {
    const types = await prisma.counterpartyType.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return types
  } catch (error) {
    console.error('Error fetching entity types:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Failed to fetch entity types: ${error.message}`)
    }
    throw new Error('Failed to fetch entity types: Unknown error')
  }
} 