'use server'

import { prisma } from '@/server/db/client'
import { type FacilityPositionInput, facilityPositionInputSchema } from '@/server/types/facility-position'

export async function createFacilityPosition(data: FacilityPositionInput) {
  try {
    // Validate input data
    const validatedData = facilityPositionInputSchema.parse(data)

    // Get facility to validate against
    const facility = await prisma.facility.findUnique({
      where: { id: validatedData.facilityId },
      include: {
        positions: true,
        creditAgreement: true,
        loans: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    })

    if (!facility) {
      throw new Error('Facility not found')
    }

    // Calculate total existing shares
    const totalExistingShares = facility.positions.reduce(
      (sum, position) => sum + position.share,
      0
    )

    // Validate total shares won't exceed 100%
    if (totalExistingShares + validatedData.share > 100) {
      throw new Error('Total position shares would exceed 100%')
    }

    // Calculate total existing positions amount
    const totalExistingAmount = facility.positions.reduce(
      (sum, position) => sum + position.amount,
      0
    )

    // Validate new position won't exceed facility commitment
    if (totalExistingAmount + validatedData.amount > facility.commitmentAmount) {
      throw new Error('Total positions would exceed facility commitment')
    }

    // Calculate total outstanding loans
    const totalOutstandingLoans = facility.loans.reduce(
      (sum, loan) => sum + loan.outstandingAmount,
      0
    )

    // Validate position amount against outstanding loans
    const positionShare = validatedData.share / 100
    const requiredAmount = totalOutstandingLoans * positionShare
    if (validatedData.amount < requiredAmount) {
      throw new Error('Position amount must cover pro-rata share of outstanding loans')
    }

    // Create position
    const position = await prisma.facilityPosition.create({
      data: validatedData
    })

    return position
  } catch (error) {
    console.error('Error in createFacilityPosition:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
} 