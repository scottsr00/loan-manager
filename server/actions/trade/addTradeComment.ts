'use server'

import { db } from '@/server/db'
import type { TradeComment } from './getTradeComments'

export async function addTradeComment(tradeId: number, content: string): Promise<TradeComment> {
  try {
    // Verify trade exists
    const trade = await db.trade.findUnique({
      where: { id: tradeId }
    })

    if (!trade) {
      throw new Error('Trade not found')
    }

    const comment = await db.tradeComment.create({
      data: {
        tradeId,
        content
      }
    })

    return comment
  } catch (error) {
    console.error('Error adding trade comment:', error)
    throw new Error('Failed to add trade comment')
  }
} 