'use server'

import { prisma } from '@/lib/prisma'

export interface LenderPosition {
  lenderId: string
  lenderName: string
  balance: number
}

export interface LoanPosition {
  id: string
  dealName: string
  currentBalance: number
  currentPeriodTerms: string
  priorPeriodPaymentStatus: 'Paid' | 'Overdue' | 'Pending'
  agentBank: string
  lenderPositions: LenderPosition[]
}

interface PrismaLenderPosition {
  lender: {
    id: string
    name: string
  }
  balance: number
}

interface PrismaLoan {
  id: string
  dealName: string
  currentBalance: number
  currentPeriodTerms: string
  priorPeriodPaymentStatus: string
  agentBank: string
  lenderPositions: PrismaLenderPosition[]
}

export async function getInventory(): Promise<LoanPosition[]> {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        lenderPositions: {
          include: {
            lender: true,
          },
        },
      },
    }) as unknown as PrismaLoan[]

    return loans.map((loan: PrismaLoan) => ({
      id: loan.id,
      dealName: loan.dealName,
      currentBalance: loan.currentBalance,
      currentPeriodTerms: loan.currentPeriodTerms,
      priorPeriodPaymentStatus: loan.priorPeriodPaymentStatus as 'Paid' | 'Overdue' | 'Pending',
      agentBank: loan.agentBank,
      lenderPositions: loan.lenderPositions.map((position: PrismaLenderPosition) => ({
        lenderId: position.lender.id,
        lenderName: position.lender.name,
        balance: position.balance,
      })),
    }))
  } catch (error) {
    console.error('Error in getInventory:', error)
    return []
  }
}