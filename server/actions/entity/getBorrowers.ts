'use server'

import { prisma } from '@/server/db/client'

export async function getBorrowers() {
  try {
    const borrowers = await prisma.entity.findMany({
      where: {
        borrower: {
          isNot: null
        }
      },
      orderBy: {
        legalName: 'asc'
      }
    })

    if (!borrowers) {
      throw new Error('No borrowers found')
    }

    return borrowers
  } catch (error) {
    console.error('Error fetching borrowers:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Failed to fetch borrowers: ${error.message}`)
    }
    throw new Error('Failed to fetch borrowers: Unknown error')
  }
} 