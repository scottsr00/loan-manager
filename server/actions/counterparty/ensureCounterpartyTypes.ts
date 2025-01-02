'use server'

import { prisma } from '@/lib/prisma'

const REQUIRED_TYPES = [
  { name: 'LENDER', description: 'Entity that can lend in facilities' },
  { name: 'BORROWER', description: 'Entity that can borrow from facilities' },
  { name: 'AGENT', description: 'Entity that can act as an agent' }
]

export async function ensureCounterpartyTypes() {
  try {
    for (const type of REQUIRED_TYPES) {
      // Check if type exists
      const existingType = await prisma.counterpartyType.findFirst({
        where: { name: type.name }
      })

      if (!existingType) {
        // Create if it doesn't exist
        await prisma.counterpartyType.create({
          data: {
            name: type.name,
            description: type.description
          }
        })
      }
    }
  } catch (error) {
    console.error('Error ensuring counterparty types:', error)
    throw error instanceof Error ? error : new Error('Failed to ensure counterparty types')
  }
} 