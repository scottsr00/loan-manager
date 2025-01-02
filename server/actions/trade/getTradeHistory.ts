'use server'

import { prisma } from '@/lib/prisma'
import { type TradeWithRelations } from '@/server/types/trade'

export async function getTradeHistory(): Promise<TradeWithRelations[]> {
  try {
    const trades = await prisma.trade.findMany({
      include: {
        facility: {
          include: {
            creditAgreement: true
          }
        },
        sellerCounterparty: {
          include: {
            entity: {
              select: {
                id: true,
                legalName: true
              }
            }
          }
        },
        buyerCounterparty: {
          include: {
            entity: {
              select: {
                id: true,
                legalName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return trades
  } catch (error) {
    console.error('Error fetching trade history:', error)
    throw error
  }
} 