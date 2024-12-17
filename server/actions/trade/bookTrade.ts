'use server'

import { prisma } from '@/server/db/client'
import { type TradeInput } from '@/server/types'

export async function bookTrade(params: TradeInput) {
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid trade parameters')
  }

  try {
    const trade = await prisma.trade.create({
      data: {
        loanId: params.loanId,
        quantity: params.quantity,
        price: params.price,
        counterparty: params.counterparty,
        tradeType: params.tradeType,
        tradeDate: new Date(),
        expectedSettlementDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        accruedInterest: 0,
        status: 'Open',
        historicalBalances: {
          create: [
            {
              date: new Date().toISOString().split('T')[0],
              balance: params.quantity
            }
          ]
        }
      },
      include: {
        loan: true,
        historicalBalances: true
      }
    })

    return { success: true, trade }
  } catch (error) {
    console.error('Error booking trade:', error)
    throw new Error('Failed to book trade')
  }
} 