'use server'

import { db } from '@/server/db'
import { type CounterpartyType } from '@prisma/client'

export async function getCounterpartyTypes(): Promise<CounterpartyType[]> {
  try {
    const types = await db.counterpartyType.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return types
  } catch (error) {
    console.error('Error in getCounterpartyTypes:', error)
    throw new Error('Failed to fetch counterparty types')
  }
} 