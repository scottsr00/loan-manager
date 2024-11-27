'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAnalytics() {
  try {
    // Fetch all trades
    const trades = await prisma.trade.findMany({
      include: {
        loan: true,
      },
      orderBy: {
        tradeDate: 'desc',
      },
    })

    // Calculate trade volume by date
    const tradeVolume = trades.reduce((acc, trade) => {
      const date = trade.tradeDate.toISOString().split('T')[0]
      const existingEntry = acc.find(entry => entry.date === date)
      if (existingEntry) {
        existingEntry.volume += trade.quantity
      } else {
        acc.push({ date, volume: trade.quantity })
      }
      return acc
    }, [] as { date: string; volume: number }[])

    // Calculate buys vs sells
    const buysSells = trades.reduce((acc, trade) => {
      const type = trade.tradeType
      const existingEntry = acc.find(entry => entry.type === type)
      if (existingEntry) {
        existingEntry.amount += trade.quantity
      } else {
        acc.push({ type, amount: trade.quantity })
      }
      return acc
    }, [] as { type: string; amount: number }[])

    // Calculate positions by deal
    const positionsByDeal = await prisma.loan.findMany({
      select: {
        dealName: true,
        currentBalance: true,
      },
    })

    // Calculate lender shares by deal
    const lenderShares = await prisma.loan.findMany({
      include: {
        lenderPositions: {
          include: {
            lender: true,
          },
        },
      },
    }).then(loans => loans.map(loan => ({
      dealName: loan.dealName,
      shares: loan.lenderPositions.map(pos => ({
        lenderName: pos.lender.name,
        share: pos.balance,
      })),
    })))

    // Calculate accrual projection
    const today = new Date()
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const accrualProjection = Array.from(
      { length: endOfMonth.getDate() - today.getDate() + 1 },
      (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        return {
          date: date.toISOString().split('T')[0],
          amount: Math.random() * 1000000 // Replace with actual accrual calculation
        }
      }
    )

    return {
      tradeVolume,
      buysSells,
      positionsByDeal: positionsByDeal.map(deal => ({
        dealName: deal.dealName,
        position: deal.currentBalance,
      })),
      lenderShares,
      accrualProjection,
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    throw error
  }
} 