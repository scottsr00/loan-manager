'use server'

import { prisma } from '@/server/db/client'
import type { Borrower, Entity } from '@prisma/client'

export type BorrowerWithEntity = Borrower & {
  entity: Entity
}

export async function getBorrowers(): Promise<BorrowerWithEntity[]> {
  try {
    const borrowers = await prisma.borrower.findMany({
      include: {
        entity: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!borrowers) {
      throw new Error('No borrowers found')
    }

    return borrowers
  } catch (error) {
    console.error('Error in getBorrowers:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch borrowers: ${error.message}`)
    }
    throw new Error('Failed to fetch borrowers')
  }
} 