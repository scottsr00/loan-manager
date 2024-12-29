'use server'

import { prisma } from '@/server/db/client'
import { type LoanWithRelations } from '@/server/types'

export async function getInventory(): Promise<LoanWithRelations[]> {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        lenderPositions: {
          include: {
            lender: {
              select: {
                legalName: true
              }
            }
          }
        },
        trades: {
          where: {
            status: 'Open'
          },
          select: {
            id: true,
            quantity: true,
            price: true,
            tradeType: true,
            status: true,
            tradeDate: true
          }
        }
      },
      orderBy: {
        dealName: 'asc'
      }
    })

    return loans.map(loan => ({
      ...loan,
      trades: loan.trades.map(trade => ({
        ...trade,
        id: trade.id.toString()
      }))
    }))
  } catch (error) {
    console.error('Error in getInventory:', error)
    throw new Error('Failed to fetch loan inventory')
  }
} 