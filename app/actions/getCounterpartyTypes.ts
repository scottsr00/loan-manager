'use server'

import { prisma } from '@/lib/prisma'

export type CounterpartyType = {
  id: string
  name: string
  description: string | null
}

export async function getCounterpartyTypes(): Promise<CounterpartyType[]> {
  try {
    const types = await prisma.counterpartyType.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return types
  } catch (error) {
    console.error('Error in getCounterpartyTypes:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch counterparty types: ${error.message}`)
    }
    throw new Error('Failed to fetch counterparty types: Unknown error')
  }
} 