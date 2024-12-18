'use server'

import { prisma } from '@/server/db/client'
import type { Borrower } from '@/types/borrower'

export async function getBorrowers(): Promise<Borrower[]> {
  try {
    const borrowers = await prisma.borrower.findMany({
      include: {
        entity: {
          include: {
            entityType: true,
            addresses: {
              where: {
                isPrimary: true
              }
            },
            contacts: {
              where: {
                isPrimary: true
              }
            }
          }
        },
        requiredDocuments: true,
        financialStatements: {
          orderBy: {
            statementDate: 'desc'
          },
          take: 1
        },
        covenants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return borrowers.map(borrower => ({
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
      createdAt: borrower.createdAt,
      businessType: borrower.businessType,
      status: borrower.status,
      riskRating: borrower.riskRating,
      amlStatus: borrower.amlStatus,
      sanctionsStatus: borrower.sanctionsStatus
    }))
  } catch (error) {
    console.error('Error in getBorrowers:', error)
    throw new Error('Failed to fetch borrowers')
  }
} 