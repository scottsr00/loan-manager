'use server'

import { prisma } from '@/server/db/client'
import { type Loan, type Prisma } from '@prisma/client'

type LoanWithRelations = Prisma.LoanGetPayload<{
  include: {
    facility: {
      include: {
        creditAgreement: {
          include: {
            borrower: true
            lender: true
          }
        }
        positions: {
          include: {
            lender: {
              include: {
                entity: true
              }
            }
          }
        }
      }
    }
    transactions: true
  }
}>

export async function getInventory(): Promise<LoanWithRelations[]> {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        facility: {
          include: {
            creditAgreement: {
              include: {
                borrower: true,
                lender: true
              }
            },
            positions: {
              include: {
                lender: {
                  include: {
                    entity: true
                  }
                }
              }
            }
          }
        },
        transactions: {
          where: {
            status: 'PENDING'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return loans
  } catch (error) {
    console.error('Error in getInventory:', error)
    throw new Error('Failed to fetch loan inventory')
  }
} 