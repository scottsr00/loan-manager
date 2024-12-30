'use server'

import { db } from '@/server/db'
import { type CreditAgreementInput, type CreditAgreementWithRelations, type FacilityInput } from '@/server/types/credit-agreement'
import { Prisma } from '@prisma/client'

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
    const borrower = await db.borrower.findUnique({
      where: { id: data.borrowerId }
    })
    if (!borrower) {
      throw new Error('Borrower not found')
    }

    // Validate lender exists
    const lender = await db.lender.findUnique({
      where: { id: data.lenderId }
    })
    if (!lender) {
      throw new Error('Lender not found')
    }

    const creditAgreement = await db.creditAgreement.create({
      data: {
        agreementNumber: data.agreementNumber,
        borrower: {
          connect: {
            id: data.borrowerId
          }
        },
        lender: {
          connect: {
            id: data.lenderId
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
          }))
        }
      },
      include: {
        borrower: true,
        lender: true,
        facilities: {
          include: {
            trades: {
              include: {
                counterparty: true,
              },
            },
          },
        },
        transactions: true,
      },
    }) as unknown as CreditAgreementWithRelations

    return creditAgreement
  } catch (error) {
    console.error('Error creating credit agreement:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create credit agreement')
  }
} 