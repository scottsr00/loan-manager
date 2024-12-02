'use server'

import { prisma } from '@/lib/prisma'

export interface HistoricalBalance {
  date: string
  balance: number
}

export interface Trade {
  id: number
  loanId: string
  dealName: string
  quantity: number
  price: number
  counterparty: string
  tradeDate: Date
  expectedSettlementDate: Date
  accruedInterest: number
  status: 'Open' | 'Completed'
  tradeType: 'Buy' | 'Sell'
  historicalBalances: HistoricalBalance[]
  costOfCarryAccrued: number
  lastCarryCalculation?: Date
}

interface PrismaTrade {
  id: number
  loanId: string
  quantity: number
  price: number
  counterparty: string
  tradeDate: Date
  expectedSettlementDate: Date
  accruedInterest: number
  status: string
  tradeType: string
  costOfCarryAccrued: number
  lastCarryCalculation: Date | null
  loan: {
    dealName: string
  }
  historicalBalances: {
    id: number
    date: string
    balance: number
    tradeId: number
  }[]
}

export async function getTradeHistory(): Promise<Trade[]> {
  try {
    const trades = await prisma.trade.findMany({
      include: {
        historicalBalances: true,
        loan: {
          select: {
            dealName: true
          }
        }
      },
      orderBy: {
        tradeDate: 'desc',
      },
    }) as unknown as PrismaTrade[]

    return trades.map((trade) => ({
      id: trade.id,
      loanId: trade.loanId,
      dealName: trade.loan.dealName,
      quantity: trade.quantity,
      price: trade.price,
      counterparty: trade.counterparty,
      tradeDate: trade.tradeDate,
      expectedSettlementDate: trade.expectedSettlementDate,
      accruedInterest: trade.accruedInterest,
      status: trade.status as 'Open' | 'Completed',
      tradeType: trade.tradeType as 'Buy' | 'Sell',
      costOfCarryAccrued: trade.costOfCarryAccrued,
      lastCarryCalculation: trade.lastCarryCalculation || undefined,
      historicalBalances: trade.historicalBalances.map(hb => ({
        date: hb.date,
        balance: hb.balance,
      })),
    }))
  } catch (error) {
    console.error('Error in getTradeHistory:', error)
    return []
  }
} 