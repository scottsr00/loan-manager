'use server'

import { db } from '@/server/db'

export interface TradeComment {
  id: number
  tradeId: number
  content: string
  createdAt: Date
  updatedAt: Date
}

export async function getTradeComments(tradeId: number): Promise<TradeComment[]> {
  try {
    const comments = await db.tradeComment.findMany({
      where: {
        tradeId: tradeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return comments
  } catch (error) {
    console.error('Error fetching trade comments:', error)
    throw new Error('Failed to fetch trade comments')
  }
} 