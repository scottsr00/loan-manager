'use server'

import { prisma } from '@/server/db/client'
import { type TradeInput, tradeInputSchema, type PrismaTransaction, TradeActivityType, TransactionStatus } from '@/server/types/trade'
import { revalidatePath } from 'next/cache'

export async function createTrade(input: TradeInput) {
  try {
    // Validate input
    const validatedData = tradeInputSchema.parse(input)

    // Calculate settlement amount
    const settlementAmount = (validatedData.parAmount * validatedData.price) / 100

    // Create trade with initial transaction record
    const trade = await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Create the trade
      const newTrade = await tx.trade.create({
        data: {
          ...validatedData,
          settlementAmount,
          status: 'PENDING',
          transactions: {
            create: {
              activityType: TradeActivityType.TRADE_CREATED,
              amount: validatedData.parAmount,
              status: TransactionStatus.COMPLETED,
              description: `Trade created: ${validatedData.parAmount} at ${validatedData.price}%`,
              effectiveDate: new Date(),
              processedBy: 'SYSTEM'
            }
          }
        },
        include: {
          facility: {
            include: {
              creditAgreement: true
            }
          },
          seller: {
            include: {
              entity: true
            }
          },
          buyer: {
            include: {
              entity: true
            }
          },
          transactions: true
        }
      })

      return newTrade
    })

    revalidatePath('/trades')
    return trade
  } catch (error) {
    console.error('Error in createTrade:', error)
    throw error instanceof Error ? error : new Error('Failed to create trade')
  }
} 