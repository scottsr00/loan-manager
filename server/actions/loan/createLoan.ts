'use server'

import { prisma } from '@/server/db/client'
import { type LoanInput } from '@/server/types'

export async function createLoan(data: LoanInput) {
  try {
    const loan = await prisma.loan.create({
      data: {
        dealName: data.dealName,
        currentBalance: data.currentBalance,
        currentPeriodTerms: data.currentPeriodTerms,
        priorPeriodPaymentStatus: data.priorPeriodPaymentStatus,
        agentBank: data.agentBank,
        lenderPositions: {
          create: data.lenderPositions.map(position => ({
            lenderId: position.lenderId,
            balance: position.balance
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

    return loan
  } catch (error) {
    console.error('Error creating loan:', error)
    throw new Error('Failed to create loan')
  }
} 