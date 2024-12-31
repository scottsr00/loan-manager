'use server'

import { prisma } from '@/server/db/client'
import { TransactionEventType } from '@/server/types/transaction'
import type { Prisma } from '@prisma/client'

type TransactionWithRelations = Prisma.TransactionHistoryGetPayload<{
  select: {
    id: true
    activityType: true
    creditAgreementId: true
    loanId: true
    tradeId: true
    servicingActivityId: true
    amount: true
    currency: true
    status: true
    description: true
    effectiveDate: true
    processedBy: true
    createdAt: true
    updatedAt: true
    creditAgreement: {
      select: {
        agreementNumber: true
      }
    }
    loan: {
      select: {
        amount: true
        outstandingAmount: true
      }
    }
    trade: {
      select: {
        amount: true
        price: true
      }
    }
    servicingActivity: {
      select: {
        description: true
        activityType: true
      }
    }
  }
}>

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

    // If facilityId is provided, we only want transactions that belong to this facility
    const where = facilityId ? {
      OR: [
        // Transactions linked to loans in this facility
        {
          loan: {
            facilityId
          }
        },
        // Transactions linked to trades in this facility
        {
          trade: {
            facilityId
          }
        },
        // Transactions linked to servicing activities in this facility
        {
          servicingActivity: {
            facilityId
          }
        }
      ],
      ...(type && { type }),
      ...(startDate && endDate && {
        effectiveDate: {
          gte: startDate,
          lte: endDate
        }
      })
    } : {
      // If no facilityId, use other filters
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

    console.log('Transaction query where clause:', JSON.stringify(where, null, 2))

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
            amount: true,
            outstandingAmount: true,
            facilityId: true,
            facility: {
              select: {
                facilityName: true
              }
            }
          }
        },
        trade: {
          select: {
            amount: true,
            price: true,
            facilityId: true
          }
        },
        servicingActivity: {
          select: {
            description: true,
            activityType: true,
            facilityId: true
          }
        }
      },
      orderBy: {
        effectiveDate: 'desc'
      }
    })

    console.log('Found transactions:', transactions.length)
    return transactions.map((transaction: TransactionWithRelations) => ({
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