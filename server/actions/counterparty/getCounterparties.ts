'use server'

import { db } from '@/server/db'
import { type Counterparty, type CounterpartyAddress, type CounterpartyContact } from '@prisma/client'

type CounterpartyWithRelations = Counterparty & {
  type: {
    name: string
  }
  addresses: CounterpartyAddress[]
  contacts: CounterpartyContact[]
}

export async function getCounterparties(): Promise<CounterpartyWithRelations[]> {
  try {
    const counterparties = await db.counterparty.findMany({
      include: {
        type: true,
        addresses: true,
        contacts: true,
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