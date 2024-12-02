'use server'

import { PrismaClient } from '@prisma/client'
import { getHistoricalRates } from './getHistoricalRates'

const prisma = new PrismaClient()

const DAYS_IN_YEAR = 360 // Standard for loan calculations

interface CarryResult {
  tradeId: number
  carryAmount: number
  daysAccrued: number
  rate: number
}

export async function calculateCarry(): Promise<CarryResult[]> {
  try {
    // Get all open trades that have been open for more than 7 days
    const openTrades = await prisma.trade.findMany({
      where: {
        status: 'Open',
        tradeDate: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      },
      include: {
        loan: true
      }
    })

    if (openTrades.length === 0) return []

    // Get current OBFR rate
    const rates = await getHistoricalRates('5d')
    const currentOBFR = rates.find(r => r.name === 'OBFR')?.data.slice(-1)[0]?.value || 0

    const results: CarryResult[] = []

    for (const trade of openTrades) {
      const lastCalc = trade.lastCarryCalculation || trade.tradeDate
      const now = new Date()
      const daysToAccrue = Math.floor((now.getTime() - lastCalc.getTime()) / (24 * 60 * 60 * 1000))

      if (daysToAccrue === 0) continue

      let carryAmount = 0
      const notional = trade.quantity * trade.price / 100 // Convert price from percentage to decimal

      if (trade.tradeType === 'Sell') {
        // If selling, receive OBFR
        carryAmount = (notional * currentOBFR * daysToAccrue) / (DAYS_IN_YEAR * 100)
      } else {
        // If buying, receive the loan coupon
        const loanRate = parseFloat(trade.loan.currentPeriodTerms.split('+')[1]) || 0
        carryAmount = (notional * loanRate * daysToAccrue) / (DAYS_IN_YEAR * 100)
      }

      // Update the trade with new carry amount
      await prisma.trade.update({
        where: { id: trade.id },
        data: {
          costOfCarryAccrued: trade.costOfCarryAccrued + carryAmount,
          lastCarryCalculation: now
        }
      })

      results.push({
        tradeId: trade.id,
        carryAmount,
        daysAccrued: daysToAccrue,
        rate: trade.tradeType === 'Sell' ? currentOBFR : parseFloat(trade.loan.currentPeriodTerms.split('+')[1]) || 0
      })
    }

    return results
  } catch (error) {
    console.error('Error calculating carry:', error)
    throw error
  }
} 