'use server'

import { db } from '@/server/db'
import { type CreditAgreementInput, type CreditAgreementWithRelations, type FacilityInput } from '@/server/types/credit-agreement'
import { Prisma } from '@prisma/client'

export async function createCreditAgreement(
  data: CreditAgreementInput
): Promise<CreditAgreementWithRelations> {
  try {
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
          create: data.facilities.map((facility: FacilityInput) => ({
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
      } satisfies Prisma.CreditAgreementCreateInput,
      include: {
        facilities: {
          include: {
            trades: {
              include: {
                counterparty: true
              }
            }
          }
        },
        borrower: {
          include: {
            borrower: true
          }
        },
        lender: {
          include: {
            lender: true
          }
        },
        transactions: true
      }
    })

    return creditAgreement as CreditAgreementWithRelations
  } catch (error) {
    console.error('Error creating credit agreement:', error)
    throw new Error('Failed to create credit agreement')
  }
} 