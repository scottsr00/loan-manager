'use server'

import { prisma } from '@/lib/prisma'

export async function getFacilityList() {
  try {
    const facilities = await prisma.facility.findMany({
      where: {
        status: 'ACTIVE'  // Only get active facilities
      },
      select: {
        id: true,
        facilityName: true,
        commitmentAmount: true,
        maturityDate: true,
        currency: true
      },
      orderBy: {
        facilityName: 'asc'
      }
    })

    return facilities
  } catch (error) {
    console.error('Error in getFacilityList:', error)
    throw new Error('Failed to fetch facilities')
  }
} 