'use server'

import { prisma } from '@/server/db/client'
import { type TradeComment } from '@/server/types'

export async function getTradeComments(tradeId: string): Promise<TradeComment[]> {
  try {
    const comments = await prisma.tradeComment.findMany({
      where: {
        tradeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return comments.map(comment => ({
      id: comment.id,
      tradeId: comment.tradeId,
      comment: comment.comment,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }))
  } catch (error) {
    console.error('Error fetching trade comments:', error)
    throw new Error('Failed to fetch trade comments')
  }
} 