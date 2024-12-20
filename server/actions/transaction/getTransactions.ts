'use server'

import { prisma } from '@/server/db/client'

interface GetTransactionsParams {
  facilityId?: string
  creditAgreementId?: string
  loanId?: string
  tradeId?: string
  servicingActivityId?: string
  eventType?: string
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
      eventType,
      startDate,
      endDate
    } = params

    const where = {
      ...(facilityId && { facilityId }),
      ...(creditAgreementId && { creditAgreementId }),
      ...(loanId && { loanId }),
      ...(tradeId && { tradeId }),
      ...(servicingActivityId && { servicingActivityId }),
      ...(eventType && { eventType }),
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
        facility: {
          select: {
            facilityName: true,
            creditAgreement: {
              select: {
                agreementName: true
              }
            }
          }
        },
        loan: {
          select: {
            drawdownNumber: true,
            amount: true
          }
        },
        trade: {
          select: {
            tradeDate: true,
            amount: true
          }
        },
        servicingActivity: {
          select: {
            activityType: true,
            amount: true
          }
        }
      },
      orderBy: {
        effectiveDate: 'desc'
      }
    })

    return transactions
  } catch (error) {
    console.error('Error in getTransactions:', error)
    throw new Error('Failed to fetch transaction history')
  }
} 