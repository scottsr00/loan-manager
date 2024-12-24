'use server'

import { db } from '@/server/db'
import { type Counterparty } from '@prisma/client'
import { revalidatePath } from 'next/cache'

type CreateCounterpartyInput = {
  name: string
  typeId: string
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING'
}

export async function createCounterparty(data: CreateCounterpartyInput): Promise<Counterparty> {
  try {
    // Validate counterparty type exists
    const counterpartyType = await db.counterpartyType.findUnique({
      where: { id: data.typeId },
    })

    if (!counterpartyType) {
      throw new Error('Invalid counterparty type')
    }

    // Create the counterparty using unchecked create for direct typeId assignment
    const counterparty = await db.counterparty.create({
      data: {
        name: data.name,
        typeId: data.typeId,
        status: data.status || 'ACTIVE',
      } as any, // Temporary type assertion to bypass strict checking
    })

    revalidatePath('/counterparties')
    return counterparty
  } catch (error) {
    console.error('Error creating counterparty:', error)
    throw error
  }
} 