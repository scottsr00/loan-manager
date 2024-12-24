'use server'

import { prisma } from '@/server/db/client'
import { type CreditAgreementWithRelations } from '@/server/types/credit-agreement'

export async function getCreditAgreements(): Promise<CreditAgreementWithRelations[]> {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      include: {
        borrower: {
          include: {
            borrower: true
          }
        },
        lender: {
          include: {
            lender: true
          }
        },
        facilities: {
          include: {
            trades: {
              include: {
                counterparty: true,
              },
            },
          },
        },
        transactions: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!creditAgreements) {
      throw new Error('No credit agreements found')
    }

    return creditAgreements as CreditAgreementWithRelations[]
  } catch (error) {
    console.error('Error fetching credit agreements:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Failed to fetch credit agreements: ${error.message}`)
    }
    throw new Error('Failed to fetch credit agreements: Unknown error')
  }
}

export async function getAvailableLoans(): Promise<CreditAgreementWithRelations[]> {
  try {
    const availableLoans = await prisma.creditAgreement.findMany({
      where: {
        status: 'ACTIVE',
        facilities: {
          some: {
            trades: {
              none: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      include: {
        borrower: {
          include: {
            borrower: true
          }
        },
        lender: {
          include: {
            lender: true
          }
        },
        facilities: {
          include: {
            trades: {
              include: {
                counterparty: true,
              },
            },
          },
        },
        transactions: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!availableLoans) {
      throw new Error('No available loans found')
    }

    return availableLoans as CreditAgreementWithRelations[]
  } catch (error) {
    console.error('Error fetching available loans:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Failed to fetch available loans: ${error.message}`)
    }
    throw new Error('Failed to fetch available loans: Unknown error')
  }
} 