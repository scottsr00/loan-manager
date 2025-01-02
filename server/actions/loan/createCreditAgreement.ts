'use server'

import { prisma } from '@/lib/prisma'
import { type CreditAgreementInput, type CreditAgreementWithRelations } from '@/server/types/credit-agreement'

export async function createCreditAgreement(
  data: CreditAgreementInput
): Promise<CreditAgreementWithRelations> {
  try {
    // Validate maturity date is after start date
    if (data.maturityDate <= data.startDate) {
      throw new Error('Maturity date must be after start date')
    }

    // Validate positive amount and interest rate
    if (data.amount <= 0) {
      throw new Error('Amount must be positive')
    }
    if (data.interestRate < 0) {
      throw new Error('Interest rate must be non-negative')
    }

    // Validate at least one facility is provided
    if (!data.facilities || data.facilities.length === 0) {
      throw new Error('At least one facility is required')
    }

    // Validate borrower exists
    const borrowerEntity = await prisma.entity.findUnique({
      where: { id: data.borrowerId },
      include: {
        borrower: true
      }
    })
    if (!borrowerEntity || !borrowerEntity.borrower) {
      throw new Error('Borrower not found')
    }

    // Validate lender exists
    const lenderEntity = await prisma.entity.findUnique({
      where: { id: data.lenderId },
      include: {
        lender: true
      }
    })
    if (!lenderEntity || !lenderEntity.lender) {
      throw new Error('Lender not found')
    }

    const creditAgreement = await prisma.creditAgreement.create({
      data: {
        agreementNumber: data.agreementNumber,
        borrower: {
          connect: {
            id: borrowerEntity.id
          }
        },
        lender: {
          connect: {
            id: lenderEntity.id
          }
        },
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        startDate: data.startDate,
        maturityDate: data.maturityDate,
        interestRate: data.interestRate,
        description: data.description,
        facilities: {
          create: data.facilities.map(facility => ({
            ...facility,
            availableAmount: facility.commitmentAmount,
            positions: {
              create: {
                lenderId: lenderEntity.lender.id,
                commitmentAmount: facility.commitmentAmount,
                undrawnAmount: facility.commitmentAmount,  // Initially, all commitment is undrawn
                drawnAmount: 0,  // Initially, no amount is drawn
                share: 100, // Initial lender has 100% share
                status: 'ACTIVE'
              }
            }
          }))
        }
      },
      include: {
        borrower: true,
        lender: {
          include: {
            lender: true
          }
        },
        facilities: {
          include: {
            positions: {
              include: {
                lender: {
                  include: {
                    entity: true
                  }
                }
              }
            },
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
        }
      }
    })

    return creditAgreement
  } catch (error) {
    console.error('Error creating credit agreement:', error)
    throw error
  }
} 