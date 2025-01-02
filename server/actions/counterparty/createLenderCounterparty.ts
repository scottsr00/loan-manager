'use server'

import { prisma } from '@/lib/prisma'
import { ensureCounterpartyTypes } from './ensureCounterpartyTypes'

export async function createLenderCounterparty(entityId: string) {
  try {
    // Ensure counterparty types exist
    await ensureCounterpartyTypes()

    // Find the LENDER counterparty type
    const counterpartyType = await prisma.counterpartyType.findFirst({
      where: { name: 'LENDER' }
    })

    if (!counterpartyType) {
      throw new Error('Lender counterparty type not found')
    }

    // Check if a counterparty already exists for this entity
    const existingCounterparty = await prisma.counterparty.findUnique({
      where: { entityId },
      include: {
        entity: {
          select: {
            id: true,
            legalName: true
          }
        },
        type: true
      }
    })

    if (existingCounterparty) {
      return existingCounterparty
    }

    // Create a new counterparty
    const counterparty = await prisma.counterparty.create({
      data: {
        entityId,
        typeId: counterpartyType.id,
        status: 'ACTIVE'
      },
      include: {
        entity: {
          select: {
            id: true,
            legalName: true
          }
        },
        type: true
      }
    })

    return counterparty
  } catch (error) {
    console.error('Error creating lender counterparty:', error)
    throw error instanceof Error ? error : new Error('Failed to create lender counterparty')
  }
} 