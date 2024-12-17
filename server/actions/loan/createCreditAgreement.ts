'use server'

import { db } from '@/server/db'
import { type CreditAgreementInput, type CreditAgreementWithRelations } from '@/server/types'

export async function createCreditAgreement(
  data: CreditAgreementInput
): Promise<CreditAgreementWithRelations> {
  try {
    const creditAgreement = await db.creditAgreement.create({
      data: {
        agreementName: data.agreementName,
        agreementNumber: data.agreementNumber,
        borrowerId: data.borrowerId,
        agentBankId: data.agentBankId,
        status: data.status,
        effectiveDate: data.effectiveDate,
        maturityDate: data.maturityDate,
        totalAmount: data.totalAmount,
        currency: data.currency,
        description: data.description,
        facilities: {
          create: data.facilities.map(facility => ({
            facilityName: facility.facilityName,
            facilityType: facility.facilityType,
            commitmentAmount: facility.commitmentAmount,
            currency: facility.currency,
            startDate: facility.startDate,
            maturityDate: facility.maturityDate,
            interestType: facility.interestType,
            baseRate: facility.baseRate,
            margin: facility.margin,
            description: facility.description,
          }))
        }
      },
      include: {
        facilities: true,
        borrower: {
          include: {
            entity: true
          }
        },
        agent: true
      }
    })

    return creditAgreement
  } catch (error) {
    console.error('Error creating credit agreement:', error)
    throw new Error('Failed to create credit agreement')
  }
} 