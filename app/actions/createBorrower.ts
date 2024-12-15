'use server'

import { prisma } from '@/lib/prisma'
import type { Borrower } from '@/types/borrower'

export type CreateBorrowerInput = {
  entityId: string
  onboardingStatus?: string
  creditRating?: string
  ratingAgency?: string
  industrySegment?: string
  kycStatus?: string
}

export async function createBorrower(data: CreateBorrowerInput): Promise<Borrower> {
  try {
    if (!data.entityId) {
      throw new Error('Entity ID is required')
    }

    const borrower = await prisma.borrower.create({
      data: {
        entity: {
          connect: { id: data.entityId }
        },
        onboardingStatus: data.onboardingStatus || 'PENDING',
        creditRating: data.creditRating,
        ratingAgency: data.ratingAgency,
        industrySegment: data.industrySegment,
        kycStatus: data.kycStatus || 'PENDING',
        documentationStatus: 'INCOMPLETE',
        amlStatus: 'PENDING',
        sanctionsScreening: 'PENDING'
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

    return {
      id: borrower.id,
      name: borrower.entity.legalName,
      taxId: borrower.entity.taxId || '',
      jurisdiction: borrower.entity.addresses[0]?.country || '',
      industry: borrower.industrySegment || '',
      creditRating: borrower.creditRating || '',
      ratingAgency: borrower.ratingAgency || '',
      onboardingStatus: borrower.onboardingStatus,
      kycStatus: borrower.kycStatus,
      entityId: borrower.entityId,
      createdAt: borrower.createdAt
    }
  } catch (error) {
    console.error('Error in createBorrower:', error)
    throw new Error('Failed to create borrower')
  }
} 