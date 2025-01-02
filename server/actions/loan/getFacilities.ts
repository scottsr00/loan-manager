'use server'

import { prisma } from '@/server/db/client'

export async function getFacilities() {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        creditAgreement: {
          include: {
            borrower: {
              include: {
                entity: true
              }
            },
            lender: true
          }
        },
        servicingActivities: {
          orderBy: {
            dueDate: 'desc'
          },
          where: {
            status: 'ACTIVE'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!facilities) {
      throw new Error('No facilities found')
    }

    return facilities
  } catch (error) {
    console.error('Error in getFacilities:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Failed to fetch facilities: ${error.message}`)
    }
    throw new Error('Failed to fetch facilities: Unknown error')
  }
} 
