'use server'

import { prisma } from '@/server/db/client'
import { type UpdateCreditAgreementInput } from '@/server/types/credit-agreement'

export async function updateCreditAgreement(data: UpdateCreditAgreementInput) {
  try {
    const updatedCreditAgreement = await prisma.creditAgreement.update({
      where: {
        id: data.id,
      },
      data: {
        agreementNumber: data.agreementNumber,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        startDate: data.startDate,
        maturityDate: data.maturityDate,
        interestRate: data.interestRate,
        description: data.description,
        borrowerId: data.borrowerId,
      },
      include: {
        borrower: {
          include: {
            borrower: true,
          },
        },
        lender: {
          include: {
            lender: true,
          },
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
        transactions: true,
      },
    })

    if (!updatedCreditAgreement) {
      throw new Error('Failed to update credit agreement')
    }

    return updatedCreditAgreement
  } catch (error) {
    console.error('Error updating credit agreement:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Failed to update credit agreement: ${error.message}`)
    }
    throw new Error('Failed to update credit agreement: Unknown error')
  }
} 