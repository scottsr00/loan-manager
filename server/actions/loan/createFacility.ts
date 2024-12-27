'use server'

import { prisma } from '@/server/db/client'
import { type FacilityInput, facilityInputSchema } from '@/server/types/facility'

export async function createFacility(data: FacilityInput) {
  try {
    // Validate input data
    const validatedData = facilityInputSchema.parse(data)

    // Get credit agreement to validate against
    const creditAgreement = await prisma.creditAgreement.findUnique({
      where: { id: validatedData.creditAgreementId },
      include: {
        facilities: true
      }
    })

    if (!creditAgreement) {
      throw new Error('Credit agreement not found')
    }

    // Validate facility currency matches credit agreement
    if (validatedData.currency !== creditAgreement.currency) {
      throw new Error('Facility currency must match credit agreement')
    }

    // Validate facility maturity date doesn't exceed credit agreement
    if (validatedData.maturityDate > creditAgreement.maturityDate) {
      throw new Error('Facility maturity date cannot exceed credit agreement')
    }

    // Calculate total existing facility commitments
    const totalExistingCommitments = creditAgreement.facilities.reduce(
      (sum, facility) => sum + facility.commitmentAmount,
      0
    )

    // Validate new facility commitment won't exceed credit agreement amount
    if (totalExistingCommitments + validatedData.commitmentAmount > creditAgreement.amount) {
      throw new Error('Total facility commitments would exceed credit agreement')
    }

    // Create facility
    const facility = await prisma.facility.create({
      data: validatedData
    })

    return facility
  } catch (error) {
    console.error('Error in createFacility:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
} 