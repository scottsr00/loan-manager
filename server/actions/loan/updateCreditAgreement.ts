'use server'

import { prisma } from '@/server/db/client'
import { type UpdateCreditAgreementInput } from '@/server/types/credit-agreement'

export async function updateCreditAgreement(data: UpdateCreditAgreementInput) {
  try {
    // Validate positive amount
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('Amount must be positive')
    }

    // Get existing credit agreement with facilities
    const existingAgreement = await prisma.creditAgreement.findUnique({
      where: { id: data.id },
      include: {
        facilities: true,
      },
    })

    if (!existingAgreement) {
      throw new Error('Credit agreement not found')
    }

    // Validate status transitions
    if (data.status && existingAgreement.status === 'TERMINATED') {
      throw new Error('Cannot change status of terminated agreement')
    }

    // Check if currency change is allowed
    if (data.currency && data.currency !== existingAgreement.currency && existingAgreement.facilities.length > 0) {
      throw new Error('Cannot change currency of credit agreement with existing facilities')
    }

    // Validate facility commitments against new amount
    if (data.amount) {
      const totalCommitments = existingAgreement.facilities.reduce(
        (sum: number, facility: { commitmentAmount: number }) => sum + facility.commitmentAmount,
        0
      )
      if (totalCommitments > data.amount) {
        throw new Error('Credit agreement amount cannot be less than total facility commitments')
      }
    }

    // Validate maturity date against facility maturity dates
    if (data.maturityDate) {
      const hasInvalidFacility = existingAgreement.facilities.some(
        (facility: { maturityDate: Date }) => facility.maturityDate > (data.maturityDate as Date)
      )
      if (hasInvalidFacility) {
        throw new Error('Credit agreement maturity date cannot be earlier than facility maturity dates')
      }
    }

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
        borrower: true,
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
      throw error
    }
    throw new Error('Failed to update credit agreement: Unknown error')
  }
} 