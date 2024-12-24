'use server'

import { prisma } from '@/server/db/client'

interface GetTransactionsParams {
  facilityId?: string
  creditAgreementId?: string
  loanId?: string
  tradeId?: string
  servicingActivityId?: string
  type?: string
  startDate?: Date
  endDate?: Date
}

export async function getTransactions(params: GetTransactionsParams = {}) {
  try {
    const {
      facilityId,
      creditAgreementId,
      loanId,
      tradeId,
      servicingActivityId,
      type,
      startDate,
      endDate
    } = params

    const where = {
      ...(facilityId && { facilityId }),
      ...(creditAgreementId && { creditAgreementId }),
      ...(loanId && { loanId }),
      ...(tradeId && { tradeId }),
      ...(servicingActivityId && { servicingActivityId }),
      ...(type && { type }),
      ...(startDate && endDate && {
        effectiveDate: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    const transactions = await prisma.transactionHistory.findMany({
      where,
      include: {
        creditAgreement: {
          select: {
            agreementNumber: true
          }
        },
        loan: {
          select: {
            amount: true
          }
        },
        trade: {
          select: {
            amount: true,
            price: true
          }
        },
        servicingActivity: {
          select: {
            activityType: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return transactions
  } catch (error) {
    console.error('Error in getTransactions:', error)
    throw new Error('Failed to fetch transaction history')
  }
} 