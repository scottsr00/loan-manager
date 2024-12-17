'use server'

import { prisma } from '@/server/db/client'

interface CashFlow {
  date: Date
  amount: number
  type: 'Principal' | 'Interest'
  balance: number
}

interface LoanCashFlowsInput {
  loanId: string
  startDate: Date
  endDate: Date
  currentRate: number
}

export async function calculateLoanCashFlows(input: LoanCashFlowsInput): Promise<CashFlow[]> {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: input.loanId },
      select: {
        currentBalance: true,
        currentPeriodTerms: true
      }
    })

    if (!loan) {
      throw new Error('Loan not found')
    }

    // Calculate monthly payments based on loan terms
    const monthlyRate = input.currentRate / 12 / 100
    const remainingMonths = Math.ceil((input.endDate.getTime() - input.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
    const monthlyPayment = (loan.currentBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -remainingMonths))

    const cashFlows: CashFlow[] = []
    let remainingBalance = loan.currentBalance
    let currentDate = new Date(input.startDate)

    while (currentDate <= input.endDate && remainingBalance > 0) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      
      cashFlows.push({
        date: new Date(currentDate),
        amount: interestPayment,
        type: 'Interest',
        balance: remainingBalance
      })

      cashFlows.push({
        date: new Date(currentDate),
        amount: principalPayment,
        type: 'Principal',
        balance: remainingBalance - principalPayment
      })

      remainingBalance -= principalPayment
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    return cashFlows
  } catch (error) {
    console.error('Error calculating loan cash flows:', error)
    throw new Error('Failed to calculate loan cash flows')
  }
} 