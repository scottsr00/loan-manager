'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface CreateCreditAgreementData {
  agreementName: string
  agreementNumber: string
  borrowerId: string
  agentBankId: string
  status: string
  effectiveDate: Date
  maturityDate: Date
  totalAmount: number
  currency: string
  description?: string
  facilities: {
    facilityName: string
    facilityType: string
    commitmentAmount: number
    currency: string
    startDate: Date
    maturityDate: Date
    interestType: string
    baseRate: string
    margin: number
    description?: string
  }[]
}

export async function createCreditAgreement(data: CreateCreditAgreementData) {
  try {
    const creditAgreement = await prisma.creditAgreement.create({
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
            status: 'ACTIVE',
          })),
        },
      },
      include: {
        borrower: {
          select: {
            id: true,
            legalName: true,
          },
        },
        agent: {
          select: {
            id: true,
            legalName: true,
          },
        },
        facilities: {
          select: {
            id: true,
            facilityName: true,
            facilityType: true,
            status: true,
            commitmentAmount: true,
            currency: true,
            _count: {
              select: {
                loans: true,
              },
            },
          },
        },
      },
    })

    revalidatePath('/credit-agreements')
    return creditAgreement
  } catch (error) {
    console.error('Error creating credit agreement:', error)
    throw new Error('Failed to create credit agreement')
  }
} 