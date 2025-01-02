'use server'

import { prisma } from '@/lib/prisma'
import { createPositionHistory } from '../position/positionHistory'
import { type PrismaTransaction } from '@/server/types/trade'

export async function closeTrade(tradeId: string, userId: string) {
  try {
    return await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Get the trade with related data
      const trade = await tx.trade.findUnique({
        where: { id: tradeId },
        include: {
          facility: true,
          sellerCounterparty: {
            include: {
              entity: true
            }
          },
          buyerCounterparty: {
            include: {
              entity: true
            }
          }
        }
      })

      if (!trade) {
        throw new Error('Trade not found')
      }

      if (trade.status === 'CLOSED') {
        throw new Error('Trade is already closed')
      }

      // Get or create lender records for both counterparties
      const sellerLender = await tx.lender.upsert({
        where: {
          entityId: trade.sellerCounterparty.entity.id
        },
        create: {
          entityId: trade.sellerCounterparty.entity.id,
          status: 'ACTIVE'
        },
        update: {}
      })

      const buyerLender = await tx.lender.upsert({
        where: {
          entityId: trade.buyerCounterparty.entity.id
        },
        create: {
          entityId: trade.buyerCounterparty.entity.id,
          status: 'ACTIVE'
        },
        update: {}
      })

      // Get current positions using lender IDs
      const sellerPosition = await tx.facilityPosition.findFirst({
        where: {
          facilityId: trade.facilityId,
          lenderId: sellerLender.id
        }
      })

      const buyerPosition = await tx.facilityPosition.findFirst({
        where: {
          facilityId: trade.facilityId,
          lenderId: buyerLender.id
        }
      })

      if (!sellerPosition) {
        throw new Error('Seller position not found')
      }

      // Calculate new share percentages
      const newSellerShare = ((sellerPosition.amount - trade.parAmount) / trade.facility.commitmentAmount) * 100
      const newBuyerShare = ((buyerPosition?.amount || 0 + trade.parAmount) / trade.facility.commitmentAmount) * 100

      // Update seller position
      const updatedSellerPosition = await tx.facilityPosition.update({
        where: {
          id: sellerPosition.id
        },
        data: {
          amount: sellerPosition.amount - trade.parAmount,
          share: newSellerShare
        }
      })

      // Create or update buyer position
      let updatedBuyerPosition
      if (buyerPosition) {
        updatedBuyerPosition = await tx.facilityPosition.update({
          where: {
            id: buyerPosition.id
          },
          data: {
            amount: buyerPosition.amount + trade.parAmount,
            share: newBuyerShare
          }
        })
      } else {
        updatedBuyerPosition = await tx.facilityPosition.create({
          data: {
            facilityId: trade.facilityId,
            lenderId: buyerLender.id,
            amount: trade.parAmount,
            share: newBuyerShare
          }
        })
      }

      // Record position history for seller
      await createPositionHistory({
        facilityId: trade.facilityId,
        lenderId: trade.sellerCounterparty.entity.id,
        changeType: 'TRADE',
        previousOutstandingAmount: sellerPosition.amount,
        newOutstandingAmount: updatedSellerPosition.amount,
        previousAccruedInterest: 0,
        newAccruedInterest: 0,
        changeAmount: -trade.parAmount,
        userId,
        activityType: 'TRADE',
        tradeId: trade.id,
        notes: `Trade closed - Sold ${trade.parAmount} to ${trade.buyerCounterparty.entity.legalName}`
      })

      // Record position history for buyer
      await createPositionHistory({
        facilityId: trade.facilityId,
        lenderId: trade.buyerCounterparty.entity.id,
        changeType: 'TRADE',
        previousOutstandingAmount: buyerPosition?.amount || 0,
        newOutstandingAmount: updatedBuyerPosition.amount,
        previousAccruedInterest: 0,
        newAccruedInterest: 0,
        changeAmount: trade.parAmount,
        userId,
        activityType: 'TRADE',
        tradeId: trade.id,
        notes: `Trade closed - Bought ${trade.parAmount} from ${trade.sellerCounterparty.entity.legalName}`
      })

      // Update trade status to closed
      const closedTrade = await tx.trade.update({
        where: { id: trade.id },
        data: {
          status: 'CLOSED',
          transactions: {
            create: {
              activityType: 'TRADE_CLOSED',
              amount: trade.parAmount,
              status: 'COMPLETED',
              description: 'Trade closed and positions updated',
              effectiveDate: new Date(),
              processedBy: userId
            }
          }
        },
        include: {
          facility: true,
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
          transactions: true
        }
      })

      return closedTrade
    })
  } catch (error) {
    console.error('Error closing trade:', error)
    throw error instanceof Error ? error : new Error('Failed to close trade')
  }
} 