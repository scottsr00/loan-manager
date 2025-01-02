'use server'

import { prisma } from '@/server/db/client'
import { type BorrowerInput, borrowerInputSchema } from '@/server/types/borrower'

export async function createBorrower(data: BorrowerInput) {
  try {
    // Validate input data
    const validatedData = borrowerInputSchema.parse(data)

    // Verify the entity exists
    const entity = await prisma.entity.findUnique({
      where: { id: validatedData.entityId }
    })

    if (!entity) {
      throw new Error('Entity not found')
    }

    // Check if entity already has a borrower role
    const existingBorrower = await prisma.borrower.findUnique({
      where: { entityId: validatedData.entityId }
    })

    if (existingBorrower) {
      throw new Error('Entity already has a borrower role')
    }

    // Create the borrower
    const borrower = await prisma.borrower.create({
      data: {
        entityId: validatedData.entityId,
        industrySegment: validatedData.industrySegment,
        businessType: validatedData.businessType,
        creditRating: validatedData.creditRating || null,
        ratingAgency: validatedData.ratingAgency || null,
        riskRating: validatedData.riskRating || null,
        onboardingStatus: validatedData.onboardingStatus
      },
      include: {
        entity: true
      }
    })

    return borrower
  } catch (error) {
    console.error('Error in createBorrower:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create borrower')
  }
} 