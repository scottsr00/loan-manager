'use server'

import { prisma } from '@/lib/prisma'

export async function createLenderCounterparty(entityId: string) {
  try {
    // Check if a counterparty already exists for this entity
    const existingCounterparty = await prisma.counterparty.findUnique({
      where: { entityId },
      include: {
        entity: {
          select: {
            id: true,
            legalName: true
          }
        }
      }
    })

    if (existingCounterparty) {
      return existingCounterparty
    }

    // Create a new counterparty
    const counterparty = await prisma.counterparty.create({
      data: {
        entityId,
        status: 'ACTIVE'
      },
      include: {
        entity: {
          select: {
            id: true,
            legalName: true
          }
        }
      }
    })

    return counterparty
  } catch (error) {
    console.error('Error creating lender counterparty:', error)
    throw error instanceof Error ? error : new Error('Failed to create lender counterparty')
  }
} 