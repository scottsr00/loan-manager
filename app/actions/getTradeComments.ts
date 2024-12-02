'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface TradeComment {
  id: number
  tradeId: number
  author: string
  content: string
  createdAt: Date
}

export async function getTradeComments(tradeId: number): Promise<TradeComment[]> {
  try {
    const comments = await prisma.$queryRaw<TradeComment[]>`
      SELECT id, tradeId, author, content, createdAt
      FROM TradeComment
      WHERE tradeId = ${tradeId}
      ORDER BY createdAt DESC
    `
    return comments
  } catch (error) {
    console.error('Error fetching trade comments:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
} 