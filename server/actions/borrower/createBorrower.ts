'use server'

import { prisma } from '@/server/db/client'
import { type BorrowerInput, borrowerInputSchema } from '@/server/types/borrower'

export async function createBorrower(data: BorrowerInput) {
  try {
    // Validate input data
    const validatedData = borrowerInputSchema.parse(data)

    // Create the borrower
    const borrower = await prisma.borrower.create({
      data: {
        name: validatedData.name,
        taxId: validatedData.taxId || null,
        countryOfIncorporation: validatedData.countryOfIncorporation || null,
        industrySegment: validatedData.industrySegment,
        businessType: validatedData.businessType,
        creditRating: validatedData.creditRating || null,
        ratingAgency: validatedData.ratingAgency || null,
        riskRating: validatedData.riskRating || null,
        onboardingStatus: validatedData.onboardingStatus,
        kycStatus: validatedData.kycStatus
      }
    })

    return borrower
  } catch (error) {
    console.error('Error in createBorrower:', error)
    throw new Error('Failed to create borrower')
  }
} 