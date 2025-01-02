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
          }
        },
        trades: {
          orderBy: {
            tradeDate: 'desc'
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

    console.log('Fetched facilities with activities:', 
      facilities.map(f => ({
        id: f.id,
        name: f.facilityName,
        servicingCount: f.servicingActivities?.length || 0,
        tradesCount: f.trades?.length || 0
      }))
    )

    return facilities
  } catch (error) {
    console.error('Error in getFacilities:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Failed to fetch facilities: ${error.message}`)
    }
    throw new Error('Failed to fetch facilities: Unknown error')
  }
} 
