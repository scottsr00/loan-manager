'use server'

import { prisma } from '@/lib/prisma'
import { TradeComment } from './getTradeComments'

interface AddCommentParams {
  tradeId: number
  author: string
  content: string
}

export async function addTradeComment(params: AddCommentParams): Promise<{ success: boolean; comment: TradeComment }> {
  if (!params || !params.tradeId || !params.author || !params.content) {
    throw new Error('Missing required parameters')
  }

  try {
    const comment = await prisma.$executeRaw`
      INSERT INTO TradeComment (tradeId, author, content, createdAt)
      VALUES (${params.tradeId}, ${params.author}, ${params.content}, datetime('now'))
    `

    const newComment = await prisma.$queryRaw<TradeComment[]>`
      SELECT id, tradeId, author, content, createdAt
      FROM TradeComment
      WHERE tradeId = ${params.tradeId}
      ORDER BY createdAt DESC
      LIMIT 1
    `

    return { success: true, comment: newComment[0] }
  } catch (error) {
    console.error('Error adding trade comment:', error)
    throw new Error('Failed to add comment')
  } finally {
    await prisma.$disconnect()
  }
} 