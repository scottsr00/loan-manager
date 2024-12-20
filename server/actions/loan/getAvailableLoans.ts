'use server'

import { prisma } from '@/server/db/client'

export async function getAvailableLoans() {
  try {
    const loans = await prisma.loan.findMany({
      where: {
        priorPeriodPaymentStatus: 'Current'
      },
      include: {
        trades: {
          where: {
            status: 'Open'
          }
        },
        lenderPositions: {
          include: {
            lender: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return loans.map(loan => ({
      id: loan.id,
      dealName: loan.dealName,
      currentBalance: loan.currentBalance,
      agentBank: loan.agentBank,
      status: loan.priorPeriodPaymentStatus,
      lenderCount: loan.lenderPositions.length,
      openTrades: loan.trades.length
    }))
  } catch (error) {
    console.error('Error in getAvailableLoans:', error)
    throw new Error('Failed to fetch available loans')
  }
} 