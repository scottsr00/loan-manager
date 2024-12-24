'use server'

import { prisma } from '@/server/db/client'
import type { Prisma } from '@prisma/client'

type TradeWithRelations = Prisma.TradeGetPayload<{
  include: {
    facility: {
      include: {
        creditAgreement: true
      }
    }
    counterparty: true
    transactions: true
  }
}>

export async function getTradeHistory(): Promise<TradeWithRelations[]> {
  try {
    const trades = await prisma.trade.findMany({
      include: {
        facility: {
          include: {
            creditAgreement: true
          }
        },
        counterparty: true,
        transactions: true
      },
      orderBy: {
        tradeDate: 'desc'
      }
    })

    if (!trades) {
      return []
    }

    return trades
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error fetching trade history:', errorMessage)
    throw new Error('Failed to fetch trade history: ' + errorMessage)
  }
} 