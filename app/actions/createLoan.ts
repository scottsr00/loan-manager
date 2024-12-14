'use server'

import { prisma } from '@/lib/prisma'

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
    throw new Error('Invalid parameters: payload must be an object')
  }

  // Validate required fields
  if (!params.dealName || !params.currentBalance || !params.currentPeriodTerms || 
      !params.baseRate || !params.spread || !params.agentBank || !params.lenderShares ||
      !params.startDate || !params.maturityDate) {
    throw new Error('Missing required fields')
  }

  // Validate dates
  const startDate = new Date(params.startDate)
  const maturityDate = new Date(params.maturityDate)
  
  if (isNaN(startDate.getTime()) || isNaN(maturityDate.getTime())) {
    throw new Error('Invalid date format')
  }
  
  if (maturityDate <= startDate) {
    throw new Error('Maturity date must be after start date')
  }

  // Validate lender shares
  if (!Array.isArray(params.lenderShares) || params.lenderShares.length === 0) {
    throw new Error('At least one lender share is required')
  }

  const totalShares = params.lenderShares.reduce((sum, share) => sum + share.share, 0)
  if (Math.abs(totalShares - 100) > 0.01) { // Allow for small floating point differences
    throw new Error('Lender shares must total 100%')
  }

  try {
    const loan = await prisma.loan.create({
      data: {
        dealName: params.dealName,
        currentBalance: params.currentBalance,
        currentPeriodTerms: params.currentPeriodTerms,
        priorPeriodPaymentStatus: 'Pending',
        agentBank: params.agentBank,
        startDate: startDate,
        maturityDate: maturityDate,
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