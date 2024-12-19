'use server'

import { prisma } from '@/server/db/client'
import { type TradeHistoryItem } from '@/server/types'

export async function getTradeHistory(): Promise<TradeHistoryItem[]> {
  try {
    const trades = await prisma.trade.findMany({
      include: {
        facility: {
          include: {
            creditAgreement: {
              select: {
                agreementName: true,
                amount: true
              }
            }
          }
        },
        counterparty: {
          select: {
            legalName: true
          }
        },
        historicalBalances: true,
        comments: true
      },
      orderBy: {
        tradeDate: 'desc'
      }
    })

    if (!trades) {
      return []
    }

    console.log('Raw trades from DB:', trades[0])

    const mappedTrades = trades.map(trade => {
      const mappedTrade = {
        ...trade,
        id: trade.id,
        facilityId: trade.facilityId,
        facility: {
          id: trade.facility.id,
          creditAgreement: {
            agreementName: trade.facility.creditAgreement.agreementName,
            amount: trade.facility.creditAgreement.amount
          }
        },
        counterparty: {
          legalName: trade.counterparty.legalName
        },
        amount: trade.amount,
        price: trade.price,
        tradeDate: trade.tradeDate,
        settlementDate: trade.settlementDate,
        status: trade.status,
        comments: trade.comments.map(comment => ({
          id: comment.id,
          tradeId: comment.tradeId,
          comment: comment.comment,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt
        })),
        historicalBalances: trade.historicalBalances.map(balance => ({
          id: balance.id,
          tradeId: balance.tradeId,
          date: balance.date,
          balance: balance.balance,
          createdAt: balance.createdAt,
          updatedAt: balance.updatedAt
        })),
        createdAt: trade.createdAt,
        updatedAt: trade.updatedAt
      }

      console.log('Mapped trade:', mappedTrade)
      return mappedTrade
    })

    return mappedTrades
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error fetching trade history:', errorMessage)
    throw new Error('Failed to fetch trade history: ' + errorMessage)
  }
} 