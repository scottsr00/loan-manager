'use server'

import { prisma } from '@/server/db/client'
import type { CreateBorrowerInput } from '@/types/borrower'

export async function createBorrower(data: CreateBorrowerInput) {
  try {
    // Create in a transaction
    const borrower = await prisma.$transaction(async (tx) => {
      // Create a new entity
      const entity = await tx.entity.create({
        data: {
          legalName: data.legalName,
          dba: data.dba || null,
          registrationNumber: data.registrationNumber || null,
          taxId: data.taxId || null,
          countryOfIncorporation: data.countryOfIncorporation || null,
          status: 'ACTIVE'
        }
      })

      // Create the borrower
      return tx.borrower.create({
        data: {
          entityId: entity.id,
          industrySegment: data.industrySegment,
          businessType: data.businessType,
          creditRating: data.creditRating || null,
          ratingAgency: data.ratingAgency || null,
          riskRating: data.riskRating || null,
          onboardingStatus: data.onboardingStatus || 'PENDING',
          kycStatus: data.kycStatus || 'PENDING'
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
    throw new Error('Failed to create borrower')
  }
} 