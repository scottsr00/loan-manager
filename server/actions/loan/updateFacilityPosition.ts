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
            positions: true,
            loans: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    })

    if (!existingPosition) {
      throw new Error('Position not found')
    }

    // If updating amount or share, validate against facility limits
    if (validatedData.amount || validatedData.share) {
      // Calculate total of other positions
      const totalOtherAmount = existingPosition.facility.positions.reduce(
        (sum, position) => position.id !== existingPosition.id ? sum + position.amount : sum,
        0
      )
      const totalOtherShares = existingPosition.facility.positions.reduce(
        (sum, position) => position.id !== existingPosition.id ? sum + position.share : sum,
        0
      )

      // Validate new amount won't exceed facility commitment
      if (validatedData.amount) {
        if (totalOtherAmount + validatedData.amount > existingPosition.facility.commitmentAmount) {
          throw new Error('Total positions would exceed facility commitment')
        }
      }

      // Validate total shares won't exceed 100%
      if (validatedData.share) {
        if (totalOtherShares + validatedData.share > 100) {
          throw new Error('Total position shares would exceed 100%')
        }
      }

      // Calculate total outstanding loans
      const totalOutstandingLoans = existingPosition.facility.loans.reduce(
        (sum, loan) => sum + loan.outstandingAmount,
        0
      )

      // Validate position amount against outstanding loans
      const positionShare = validatedData.share || existingPosition.share
      const requiredAmount = totalOutstandingLoans * (positionShare / 100)
      const newAmount = validatedData.amount || existingPosition.amount
      if (newAmount < requiredAmount) {
        throw new Error('Position amount must cover pro-rata share of outstanding loans')
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
        share: validatedData.share,
        status: validatedData.status
      }
    })

    return position
  } catch (error) {
    console.error('Error in updateFacilityPosition:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
} 