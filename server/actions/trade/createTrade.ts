'use server'

import { prisma } from '@/lib/prisma'
import { validateTrade } from './validateTrade'
import { TradeInput, tradeInputSchema, type PrismaTransaction } from '@/server/types/trade'
import { type Prisma } from "@prisma/client"

export async function createTrade(input: TradeInput) {
  try {
    // Validate input schema
    const validatedData = tradeInputSchema.parse(input)

    // Validate trade business rules
    const validation = await validateTrade(validatedData)
    if (!validation.isValid) {
      throw new Error(validation.message || 'Trade validation failed')
    }

    // Calculate settlement amount
    const settlementAmount = validatedData.parAmount * (validatedData.price / 100)

    // Create the trade in a transaction
    const trade = await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Create the trade record
      const newTrade = await tx.trade.create({
        data: {
          facilityId: validatedData.facilityId,
          sellerCounterpartyId: validatedData.sellerCounterpartyId,
          buyerCounterpartyId: validatedData.buyerCounterpartyId,
          tradeDate: new Date(),
          settlementDate: new Date(validatedData.settlementDate),
          parAmount: validatedData.parAmount,
          price: validatedData.price,
          settlementAmount,
          status: 'PENDING',
          transactions: {
            create: {
              activityType: 'TRADE_CREATED',
              amount: validatedData.parAmount,
              status: 'PENDING',
              description: 'Trade created',
              effectiveDate: new Date(),
              processedBy: 'SYSTEM'
            }
          }
        },
        include: {
          facility: {
            select: {
              id: true,
              facilityName: true,
              commitmentAmount: true,
              maturityDate: true
            }
          },
          sellerCounterparty: {
            select: {
              id: true,
              entity: {
                select: {
                  id: true,
                  legalName: true
                }
              }
            }
          },
          buyerCounterparty: {
            select: {
              id: true,
              entity: {
                select: {
                  id: true,
                  legalName: true
                }
              }
            }
          },
          transactions: {
            select: {
              id: true,
              activityType: true,
              amount: true,
              status: true,
              description: true,
              effectiveDate: true,
              processedBy: true
            }
          }
        }
      })

      return newTrade
    })

    return trade
  } catch (error) {
    console.error('Error creating trade:', error)
    throw error instanceof Error ? error : new Error('Failed to create trade')
  }
} 