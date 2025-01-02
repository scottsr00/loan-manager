'use server'

import { prisma } from '@/lib/prisma'
import { type UpdateCreditAgreementInput, type CreditAgreementWithRelations } from '@/server/types/credit-agreement'
import { updateCreditAgreementSchema } from '@/server/types/credit-agreement'

export async function updateCreditAgreement(
  data: UpdateCreditAgreementInput
): Promise<CreditAgreementWithRelations> {
  try {
    // Validate input data
    const validatedData = updateCreditAgreementSchema.parse(data)

    // Check if credit agreement exists
    const existingAgreement = await prisma.creditAgreement.findUnique({
      where: { id: validatedData.id }
    })

    if (!existingAgreement) {
      throw new Error('Credit agreement not found')
    }

    // If maturity date is being updated, validate it's after start date
    if (validatedData.maturityDate && validatedData.startDate) {
      if (validatedData.maturityDate <= validatedData.startDate) {
        throw new Error('Maturity date must be after start date')
      }
    } else if (validatedData.maturityDate && validatedData.maturityDate <= existingAgreement.startDate) {
      throw new Error('Maturity date must be after start date')
    } else if (validatedData.startDate && existingAgreement.maturityDate <= validatedData.startDate) {
      throw new Error('Maturity date must be after start date')
    }

    // If amount is being updated, validate it's positive
    if (validatedData.amount !== undefined && validatedData.amount <= 0) {
      throw new Error('Amount must be positive')
    }

    // If interest rate is being updated, validate it's non-negative
    if (validatedData.interestRate !== undefined && validatedData.interestRate < 0) {
      throw new Error('Interest rate must be non-negative')
    }

    // If borrower is being updated, validate it exists
    if (validatedData.borrowerId) {
      const borrower = await prisma.borrower.findUnique({
        where: { id: validatedData.borrowerId }
      })
      if (!borrower) {
        throw new Error('Borrower not found')
      }
    }

    // Update credit agreement
    const updatedAgreement = await prisma.creditAgreement.update({
      where: { id: validatedData.id },
      data: {
        agreementNumber: validatedData.agreementNumber,
        borrower: validatedData.borrowerId ? {
          connect: {
            id: validatedData.borrowerId
          }
        } : undefined,
        status: validatedData.status,
        amount: validatedData.amount,
        currency: validatedData.currency,
        startDate: validatedData.startDate,
        maturityDate: validatedData.maturityDate,
        interestRate: validatedData.interestRate,
        description: validatedData.description
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

    return updatedAgreement
  } catch (error) {
    console.error('Error updating credit agreement:', error)
    throw error
  }
} 