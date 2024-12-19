'use server'

import { prisma } from '@/server/db/client'

export async function getFacilities() {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        creditAgreement: {
          select: {
            agreementName: true,
            borrower: {
              select: {
                entity: {
                  select: {
                    legalName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        facilityName: 'asc'
      }
    })
    return facilities
  } catch (error) {
    console.error('Error in getFacilities:', error)
    throw new Error('Failed to fetch facilities')
  }
} 
