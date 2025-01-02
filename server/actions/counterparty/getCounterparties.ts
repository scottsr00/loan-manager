'use server'

import { db } from '@/server/db'
import { type CounterpartyWithRelations } from '@/server/types/counterparty'

export async function getCounterparties(): Promise<CounterpartyWithRelations[]> {
  try {
    const counterparties = await db.counterparty.findMany({
      include: {
        type: true,
        addresses: true,
        contacts: true,
        entity: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return counterparties
  } catch (error) {
    console.error('Error in getCounterparties:', error)
    throw new Error('Failed to fetch counterparties')
  }
} 