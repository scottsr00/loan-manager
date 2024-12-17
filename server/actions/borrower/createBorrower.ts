'use server'

import { db } from '@/server/db'
import { createBorrowerSchema, type CreateBorrowerInput } from '@/types/borrower'

export type { CreateBorrowerInput }

export async function createBorrower(input: CreateBorrowerInput) {
  try {
    // Validate input
    const validatedInput = createBorrowerSchema.parse(input)

    // Create borrower
    const borrower = await db.borrower.create({
      data: {
        entityId: validatedInput.entityId,
        industrySegment: validatedInput.industrySegment,
        businessType: validatedInput.businessType,
        riskRating: validatedInput.riskRating,
        creditRating: validatedInput.creditRating,
        ratingAgency: validatedInput.ratingAgency,
      },
      include: {
        entity: {
          include: {
            entityType: true,
            addresses: {
              where: {
                isPrimary: true
              }
            }
          }
        }
      }
    })

    return borrower
  } catch (error) {
    console.error('Error in createBorrower:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to create borrower: ${error.message}`)
    }
    throw new Error('Failed to create borrower')
  }
} 