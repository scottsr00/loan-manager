'use server'

import { prisma } from '@/lib/prisma'

export async function getCreditAgreementList() {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        agreementNumber: true,
        borrower: {
          select: {
            legalName: true
          }
        },
        facilities: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            facilityName: true,
            commitmentAmount: true,
            maturityDate: true,
            currency: true
          }
        }
      },
      orderBy: {
        agreementNumber: 'asc'
      }
    })

    return creditAgreements
  } catch (error) {
    console.error('Error in getCreditAgreementList:', error)
    throw new Error('Failed to fetch credit agreements')
  }
} 