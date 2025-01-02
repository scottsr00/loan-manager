'use server'

import { prisma } from '@/server/db/client'
import { type TradeWithRelations } from '@/server/types/trade'

export async function getTrades(): Promise<TradeWithRelations[]> {
  try {
    const trades = await prisma.trade.findMany({
      include: {
        facility: {
          include: {
            creditAgreement: {
              select: {
                agreementNumber: true
              }
            }
          }
        },
        sellerCounterparty: {
          include: {
            entity: true
          }
        },
        buyerCounterparty: {
          include: {
            entity: true
          }
        },
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return trades as TradeWithRelations[]
  } catch (error) {
    console.error('Error in getTrades:', error)
    throw error instanceof Error ? error : new Error('Failed to fetch trades')
  }
}

export async function getTrade(id: string): Promise<TradeWithRelations | null> {
  try {
    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        facility: {
          include: {
            creditAgreement: {
              select: {
                agreementNumber: true
              }
            }
          }
        },
        sellerCounterparty: {
          include: {
            entity: true
          }
        },
        buyerCounterparty: {
          include: {
            entity: true
          }
        },
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return trade as TradeWithRelations | null
  } catch (error) {
    console.error('Error in getTrade:', error)
    throw error instanceof Error ? error : new Error('Failed to fetch trade')
  }
} 