'use server'

import { prisma } from '@/server/db/client'
import { type BorrowerInput, borrowerInputSchema } from '@/server/types/borrower'

export async function createBorrower(data: BorrowerInput) {
  try {
    // Validate input data
    const validatedData = borrowerInputSchema.parse(data)

    // Create in a transaction
    const borrower = await prisma.$transaction(async (tx) => {
      // Create a new entity
      const entity = await tx.entity.create({
        data: {
          legalName: validatedData.legalName,
          dba: validatedData.dba || null,
          registrationNumber: validatedData.registrationNumber || null,
          taxId: validatedData.taxId || null,
          countryOfIncorporation: validatedData.countryOfIncorporation || null,
          status: 'ACTIVE'
        }
      })

      // Create the borrower
      return tx.borrower.create({
        data: {
          entityId: entity.id,
          industrySegment: validatedData.industrySegment,
          businessType: validatedData.businessType,
          creditRating: validatedData.creditRating || null,
          ratingAgency: validatedData.ratingAgency || null,
          riskRating: validatedData.riskRating || null,
          onboardingStatus: validatedData.onboardingStatus,
          kycStatus: validatedData.kycStatus
        },
        include: {
          entity: {
            include: {
              addresses: {
                where: {
                  isPrimary: true
                }
              },
              contacts: {
                where: {
                  isPrimary: true
                }
              },
              beneficialOwners: true
            }
          }
        }
      })
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