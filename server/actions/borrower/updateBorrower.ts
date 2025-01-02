'use server'

import { prisma } from '@/server/db/client'
import { type BorrowerUpdateInput, borrowerUpdateSchema } from '@/server/types/borrower'

export async function updateBorrower(id: string, data: BorrowerUpdateInput) {
  try {
    // Validate input data
    const validatedData = borrowerUpdateSchema.parse(data)

    // Get existing borrower
    const existingBorrower = await prisma.borrower.findUnique({
      where: { id }
    })

    if (!existingBorrower) {
      throw new Error('Borrower not found')
    }

    // Validate status transitions
    if (existingBorrower.onboardingStatus === 'REJECTED' && validatedData.onboardingStatus !== 'REJECTED') {
      throw new Error('Cannot change status of rejected borrower')
    }

    if (existingBorrower.kycStatus === 'REJECTED' && validatedData.kycStatus !== 'REJECTED') {
      throw new Error('Cannot change KYC status of rejected borrower')
    }

    // Update the borrower
    const updatedBorrower = await prisma.borrower.update({
      where: { id },
      data: {
        industrySegment: validatedData.industrySegment,
        businessType: validatedData.businessType,
        creditRating: validatedData.creditRating || null,
        ratingAgency: validatedData.ratingAgency || null,
        riskRating: validatedData.riskRating || null,
        onboardingStatus: validatedData.onboardingStatus,
        kycStatus: validatedData.kycStatus
      }
    })

    return updatedBorrower
  } catch (error) {
    console.error('Error in updateBorrower:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update borrower')
  }
} 