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
        creditAgreement: true
      }
    })

    if (!facility) {
      throw new Error('Facility not found')
    }

    // Calculate total existing positions
    const totalExistingPositions = facility.positions.reduce(
      (sum, position) => sum + position.amount,
      0
    )

    // Validate new position won't exceed facility commitment
    if (totalExistingPositions + validatedData.amount > facility.commitmentAmount) {
      throw new Error('Total positions would exceed facility commitment')
    }

    // Validate new position won't exceed facility available amount
    if (validatedData.amount > facility.availableAmount) {
      throw new Error('Position amount exceeds facility available amount')
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