'use server'

import { prisma } from '@/server/db/client'
import { type BorrowerInput, borrowerInputSchema } from '@/server/types/borrower'

export async function updateBorrower(id: string, data: BorrowerInput) {
  try {
    // Validate input data
    const validatedData = borrowerInputSchema.parse(data)

    // Get existing borrower
    const existingBorrower = await prisma.borrower.findUnique({
      where: { id },
      include: {
        entity: true
      }
    })

    if (!existingBorrower) {
      throw new Error('Borrower not found')
    }

    // Validate status transitions
    if (existingBorrower.onboardingStatus === 'REJECTED' && 
        validatedData.onboardingStatus !== 'REJECTED') {
      throw new Error('Cannot change status of rejected borrower')
    }

    if (existingBorrower.kycStatus === 'REJECTED' && 
        validatedData.kycStatus !== 'REJECTED') {
      throw new Error('Cannot change KYC status of rejected borrower')
    }

    // Update borrower
    const updatedBorrower = await prisma.borrower.update({
      where: { id },
      data: {
        industrySegment: validatedData.industrySegment,
        businessType: validatedData.businessType,
        creditRating: validatedData.creditRating || null,
        ratingAgency: validatedData.ratingAgency || null,
        riskRating: validatedData.riskRating || null,
        onboardingStatus: validatedData.onboardingStatus,
        kycStatus: validatedData.kycStatus,
        entity: {
          update: {
            legalName: validatedData.legalName,
            dba: validatedData.dba || null,
            registrationNumber: validatedData.registrationNumber || null,
            taxId: validatedData.taxId || null,
            countryOfIncorporation: validatedData.countryOfIncorporation || null,
          }
        }
      },
      include: {
        entity: true
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