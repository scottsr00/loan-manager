'use server'

import { prisma } from '@/lib/prisma'

export async function getBankEntities() {
  try {
    const bankEntities = await prisma.entity.findMany({
      where: {
        entityType: {
          name: {
            in: ['Bank', 'Financial Institution'],
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

    return bankEntities
  } catch (error) {
    console.error('Error fetching bank entities:', error)
    throw new Error('Failed to fetch bank entities')
  }
} 