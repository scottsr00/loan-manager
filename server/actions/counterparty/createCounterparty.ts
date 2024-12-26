'use server'

import { prisma } from '@/server/db/client'
import { type CreateCounterpartyInput } from '@/types/counterparty'

export async function createCounterparty(data: CreateCounterpartyInput) {
  try {
    // Validate required fields
    if (!data.legalName) {
      throw new Error('Legal name is required')
    }
    if (!data.typeId) {
      throw new Error('Counterparty type is required')
    }

    // Create the counterparty
    const counterparty = await prisma.counterparty.create({
      data: {
        name: data.legalName,
        typeId: data.typeId,
        status: 'ACTIVE',
      },
      include: {
        type: true,
      },
    })

    return counterparty
  } catch (error) {
    console.error('Error creating counterparty:', error)
    throw error instanceof Error ? error : new Error('Failed to create counterparty')
  }
} 