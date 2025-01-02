'use server'

import { prisma } from '@/lib/prisma'
import { type CreditAgreementWithRelations } from '@/server/types/credit-agreement'

export async function getCreditAgreements(): Promise<CreditAgreementWithRelations[]> {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      include: {
        borrower: true,
        lender: true,
        facilities: {
          include: {
            trades: {
              include: {
                sellerCounterparty: true,
                buyerCounterparty: true
              }
            }
          }
        },
        transactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return creditAgreements.filter((ca: CreditAgreementWithRelations) => ca.borrower && ca.lender)
  } catch (error) {
    console.error('Error fetching credit agreements:', error)
    throw error
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
        borrower: true,
        lender: true,
        facilities: {
          include: {
            trades: {
              include: {
                sellerCounterparty: true,
                buyerCounterparty: true
              }
            }
          }
        },
        transactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const validLoans = availableLoans.filter((loan: CreditAgreementWithRelations) => loan.borrower && loan.lender)
    if (!validLoans.length) {
      throw new Error('No available loans found')
    }

    return validLoans
  } catch (error) {
    console.error('Error fetching available loans:', error)
    throw error
  }
}

export async function getCreditAgreement(id: string): Promise<CreditAgreementWithRelations | null> {
  try {
    const creditAgreement = await prisma.creditAgreement.findUnique({
      where: { id },
      include: {
        borrower: true,
        lender: true,
        facilities: {
          include: {
            trades: {
              include: {
                sellerCounterparty: true,
                buyerCounterparty: true
              }
            }
          }
        },
        transactions: true
      }
    })

    if (!creditAgreement || !creditAgreement.borrower || !creditAgreement.lender) {
      return null
    }

    return creditAgreement
  } catch (error) {
    console.error('Error fetching credit agreement:', error)
    throw error
  }
} 