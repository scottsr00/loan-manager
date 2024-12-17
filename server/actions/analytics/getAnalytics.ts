'use server'

import { prisma } from '@/server/db/client'

export async function getAnalytics() {
  try {
    const [
      totalBorrowers,
      totalLoans,
      totalTrades,
      recentTrades
    ] = await Promise.all([
      prisma.borrower.count(),
      prisma.loan.count(),
      prisma.trade.count(),
      prisma.trade.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          loan: true
        }
      })
    ])

    return {
      totalBorrowers,
      totalLoans,
      totalTrades,
      recentTrades: recentTrades.map(trade => ({
        id: trade.id,
        dealName: trade.loan.dealName,
        tradeType: trade.tradeType,
        quantity: trade.quantity,
        price: trade.price,
        tradeDate: trade.tradeDate
      }))
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    throw new Error('Failed to fetch analytics')
  }
} 