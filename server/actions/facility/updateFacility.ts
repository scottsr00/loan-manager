'use server'

import { prisma } from '@/server/db/client'
import { revalidatePath } from 'next/cache'

interface UpdateFacilityParams {
  id: string
  facilityName?: string
  facilityType?: string
  commitmentAmount?: number
  currency?: string
  startDate?: Date
  maturityDate?: Date
  interestType?: string
  baseRate?: string
  margin?: number
  description?: string
}

export async function updateFacility(params: UpdateFacilityParams) {
  try {
    // First check if the facility exists
    const existingFacility = await prisma.facility.findUnique({
      where: { id: params.id },
      include: {
        loans: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    })

    if (!existingFacility) {
      throw new Error('Facility not found')
    }

    // Validate commitment amount changes
    if (params.commitmentAmount !== undefined) {
      const totalOutstandingLoans = existingFacility.loans.reduce((sum, loan) => sum + loan.amount, 0)
      if (params.commitmentAmount < totalOutstandingLoans) {
        throw new Error('Commitment amount cannot be less than outstanding loans')
      }
    }

    // Validate dates
    if (params.startDate && params.maturityDate) {
      if (params.maturityDate <= params.startDate) {
        throw new Error('Maturity date must be after start date')
      }
    } else if (params.startDate && params.startDate >= existingFacility.maturityDate) {
      throw new Error('Start date must be before maturity date')
    } else if (params.maturityDate && params.maturityDate <= existingFacility.startDate) {
      throw new Error('Maturity date must be after start date')
    }

    // Update the facility
    const updatedFacility = await prisma.facility.update({
      where: { id: params.id },
      data: {
        facilityName: params.facilityName,
        facilityType: params.facilityType,
        commitmentAmount: params.commitmentAmount,
        currency: params.currency,
        startDate: params.startDate,
        maturityDate: params.maturityDate,
        interestType: params.interestType,
        baseRate: params.baseRate,
        margin: params.margin,
        description: params.description,
      },
      include: {
        sublimits: true,
        creditAgreement: true,
      },
    })

    revalidatePath('/facilities')
    return updatedFacility
  } catch (error) {
    console.error('Error updating facility:', error)
    throw error instanceof Error ? error : new Error('Failed to update facility')
  }
} 