'use server'

import { prisma } from '@/server/db/client'
import { type FacilityPositionUpdate, facilityPositionUpdateSchema, facilityPositionStatusEnum } from '@/server/types/facility-position'

export async function updateFacilityPosition(data: FacilityPositionUpdate) {
  try {
    // Validate input data
    const validatedData = facilityPositionUpdateSchema.parse(data)

    // Get existing position
    const existingPosition = await prisma.facilityPosition.findUnique({
      where: { id: validatedData.id },
      include: {
        facility: {
          include: {
            positions: true
          }
        }
      }
    })

    if (!existingPosition) {
      throw new Error('Position not found')
    }

    // If updating amount, validate against facility limits
    if (validatedData.amount) {
      // Calculate total of other positions
      const totalOtherPositions = existingPosition.facility.positions.reduce(
        (sum, position) => position.id !== existingPosition.id ? sum + position.amount : sum,
        0
      )

      // Validate new amount won't exceed facility commitment
      if (totalOtherPositions + validatedData.amount > existingPosition.facility.commitmentAmount) {
        throw new Error('Total positions would exceed facility commitment')
      }
    }

    // If updating status, validate transition
    if (validatedData.status) {
      if (!facilityPositionStatusEnum.safeParse(validatedData.status).success) {
        throw new Error('Invalid position status')
      }

      // Add any specific status transition validations here
      // For example, can't change from COMPLETED to ACTIVE
      if (existingPosition.status === 'COMPLETED' && validatedData.status === 'ACTIVE') {
        throw new Error('Cannot reactivate completed position')
      }
    }

    // Update position
    const position = await prisma.facilityPosition.update({
      where: { id: validatedData.id },
      data: {
        amount: validatedData.amount,
        status: validatedData.status
      }
    })

    return position
  } catch (error) {
    console.error('Error in updateFacilityPosition:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
} 