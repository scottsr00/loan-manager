'use server'

import { prisma } from '@/server/db/client'
import { type TradeComment } from '@/server/types'

export async function addTradeComment(tradeId: string, content: string): Promise<TradeComment> {
  try {
    // Verify trade exists
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId }
    })

    if (!trade) {
      throw new Error('Trade not found')
    }

    const comment = await prisma.tradeComment.create({
      data: {
        tradeId,
        comment: content
      }
    })

    return {
      id: comment.id,
      tradeId: comment.tradeId,
      comment: comment.comment,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }
  } catch (error) {
    console.error('Error adding trade comment:', error)
    throw new Error('Failed to add trade comment')
  }
} 