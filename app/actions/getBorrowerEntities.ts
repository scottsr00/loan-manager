'use server'

import { prisma } from '@/lib/prisma'

export async function getBorrowerEntities() {
  try {
    const borrowerEntities = await prisma.entity.findMany({
      where: {
        entityType: {
          name: {
            notIn: ['Bank', 'Financial Institution'], // Exclude banks and financial institutions
          },
        },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        legalName: true,
      },
      orderBy: {
        legalName: 'asc',
      },
    })

    return borrowerEntities
  } catch (error) {
    console.error('Error fetching borrower entities:', error)
    throw new Error('Failed to fetch borrower entities')
  }
} 