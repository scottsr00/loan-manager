'use server'

import { prisma } from '@/server/db/client'
import { TransactionEventType } from '@/server/types/transaction'

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
      select: {
        id: true,
        activityType: true,
        creditAgreementId: true,
        loanId: true,
        tradeId: true,
        servicingActivityId: true,
        amount: true,
        currency: true,
        status: true,
        description: true,
        effectiveDate: true,
        processedBy: true,
        createdAt: true,
        updatedAt: true,
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
            description: true,
            activityType: true
          }
        }
      },
      orderBy: {
        effectiveDate: 'desc'
      }
    })

    return transactions.map(transaction => ({
      ...transaction,
      type: transaction.activityType as keyof typeof TransactionEventType,
      servicingActivity: transaction.servicingActivity ? {
        ...transaction.servicingActivity,
        type: transaction.servicingActivity.activityType
      } : null
    }))
  } catch (error) {
    console.error('Error in getTransactions:', error)
    throw new Error('Failed to fetch transaction history')
  }
} 