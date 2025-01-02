'use server'

import { prisma } from '@/lib/prisma'
import { type CreditAgreementWithRelations } from '@/server/types/credit-agreement'

export async function getCreditAgreement(id: string): Promise<CreditAgreementWithRelations | null> {
  try {
    const creditAgreement = await prisma.creditAgreement.findUnique({
      where: { id },
      include: {
        borrower: true,
        lender: {
          include: {
            lender: true
          }
        },
        facilities: {
          include: {
            trades: {
              include: {
                sellerCounterparty: {
                  include: {
                    entity: {
                      select: {
                        id: true,
                        legalName: true
                      }
                    }
                  }
                },
                buyerCounterparty: {
                  include: {
                    entity: {
                      select: {
                        id: true,
                        legalName: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        transactions: true
      }
    })

    if (!creditAgreement) {
      return null
    }

    return creditAgreement
  } catch (error) {
    console.error('Error fetching credit agreement:', error)
    throw error
  }
} 