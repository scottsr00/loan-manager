'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface LenderShare {
  lenderName: string
  share: number
}

interface CreateLoanParams {
  dealName: string
  currentBalance: number
  currentPeriodTerms: string
  baseRate: string
  spread: number
  agentBank: string
  startDate: string
  maturityDate: string
  lenderShares: LenderShare[]
}

export async function createLoan(params: CreateLoanParams) {
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid parameters: payload must be an object');
  }

  try {
    const loan = await prisma.loan.create({
      data: {
        dealName: params.dealName,
        currentBalance: params.currentBalance,
        currentPeriodTerms: `${params.baseRate} + ${params.spread}%`,
        priorPeriodPaymentStatus: 'Pending',
        agentBank: params.agentBank,
        startDate: new Date(params.startDate),
        maturityDate: new Date(params.maturityDate),
        lenderPositions: {
          create: params.lenderShares.map(share => ({
            lender: {
              connectOrCreate: {
                where: { name: share.lenderName },
                create: { name: share.lenderName }
              }
            },
            balance: (params.currentBalance * share.share) / 100
          }))
        }
      },
      include: {
        lenderPositions: {
          include: {
            lender: true
          }
        }
      }
    })

    return { success: true, loan }
  } catch (error) {
    console.error('Error creating loan:', error)
    throw new Error('Failed to create loan')
  }
} 