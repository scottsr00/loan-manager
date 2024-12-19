'use server'

import { db } from '@/server/db'
import { type CreditAgreementWithRelations } from '@/server/types'

interface UpdateCreditAgreementInput {
  id: string
  agreementName: string
  agreementNumber: string
  borrowerId: string
  status: string
  amount: number
  currency: string
  startDate: Date
  maturityDate: Date
  interestRate: number
  description?: string
}

export async function updateCreditAgreement(
  data: UpdateCreditAgreementInput
): Promise<CreditAgreementWithRelations> {
  try {
    const creditAgreement = await db.creditAgreement.update({
      where: { id: data.id },
      data: {
        agreementName: data.agreementName,
        agreementNumber: data.agreementNumber,
        borrowerId: data.borrowerId,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        startDate: data.startDate,
        maturityDate: data.maturityDate,
        interestRate: data.interestRate,
        description: data.description,
      },
      include: {
        borrower: {
          include: {
            entity: true
          }
        },
        lender: true,
        facilities: true
      }
    })

    return creditAgreement
  } catch (error) {
    console.error('Error updating credit agreement:', error)
    throw new Error('Failed to update credit agreement')
  }
} 