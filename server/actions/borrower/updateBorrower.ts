'use server'

import { db } from '@/server/db'
import { createBorrowerSchema, type CreateBorrowerInput } from '@/types/borrower'

export async function updateBorrower(id: string, input: CreateBorrowerInput) {
  try {
    // Validate input
    const validatedInput = createBorrowerSchema.parse(input)

    // First get the borrower to get the entityId
    const borrower = await db.borrower.findUnique({
      where: { id },
      select: { entityId: true }
    })

    if (!borrower) {
      throw new Error('Borrower not found')
    }

    // Update in a transaction
    const updatedBorrower = await db.$transaction(async (tx) => {
      // Update entity
      await tx.entity.update({
        where: { id: borrower.entityId },
        data: {
          legalName: validatedInput.legalName,
          dba: validatedInput.dba || null,
          registrationNumber: validatedInput.registrationNumber || null,
          taxId: validatedInput.taxId || null,
          countryOfIncorporation: validatedInput.countryOfIncorporation || null,
        }
      })

      // Update borrower
      return tx.borrower.update({
        where: { id },
        data: {
          industrySegment: validatedInput.industrySegment,
          businessType: validatedInput.businessType,
          creditRating: validatedInput.creditRating || null,
          ratingAgency: validatedInput.ratingAgency || null,
          riskRating: validatedInput.riskRating || null,
          onboardingStatus: validatedInput.onboardingStatus || 'PENDING',
          kycStatus: validatedInput.kycStatus || 'PENDING'
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

    return updatedBorrower
  } catch (error) {
    console.error('Error in updateBorrower:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to update borrower: ${error.message}`)
    }
    throw new Error('Failed to update borrower')
  }
} 