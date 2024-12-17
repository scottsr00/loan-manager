'use server'

import { prisma } from '@/server/db/client'
import { type TradeHistoryItem } from '@/server/types'

export async function getTradeHistory(): Promise<TradeHistoryItem[]> {
  try {
    const trades = await prisma.trade.findMany({
      include: {
        facility: {
          include: {
            creditAgreement: {
              select: {
                agreementName: true,
                amount: true
              }
            }
          }
        },
        counterparty: {
          select: {
            legalName: true
          }
        },
        historicalBalances: true,
        comments: true
      },
      orderBy: {
        tradeDate: 'desc'
      }
    })

    if (!trades) {
      return []
    }

    return trades.map(trade => ({
      ...trade,
      id: trade.id.toString(),
      counterparty: {
        legalName: trade.counterparty.legalName
      },
      creditAgreement: trade.facility.creditAgreement
    }))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error fetching trade history:', errorMessage)
    throw new Error('Failed to fetch trade history: ' + errorMessage)
  }
} 