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

      // Calculate new share percentages based on commitment amounts
      const newSellerShare = ((sellerPosition.commitmentAmount - trade.parAmount) / trade.facility.commitmentAmount) * 100
      const newBuyerShare = ((buyerPosition?.commitmentAmount || 0 + trade.parAmount) / trade.facility.commitmentAmount) * 100

      // Update seller position
      const updatedSellerPosition = await tx.facilityPosition.update({
        where: {
          id: sellerPosition.id
        },
        data: {
          commitmentAmount: sellerPosition.commitmentAmount - trade.parAmount,
          drawnAmount: sellerPosition.drawnAmount - trade.parAmount,
          undrawnAmount: sellerPosition.undrawnAmount,
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
            commitmentAmount: buyerPosition.commitmentAmount + trade.parAmount,
            drawnAmount: buyerPosition.drawnAmount + trade.parAmount,
            undrawnAmount: buyerPosition.undrawnAmount,
            share: newBuyerShare
          }
        })
      } else {
        updatedBuyerPosition = await tx.facilityPosition.create({
          data: {
            facilityId: trade.facilityId,
            lenderId: buyerLender.id,
            commitmentAmount: trade.parAmount,
            drawnAmount: trade.parAmount,
            undrawnAmount: 0,
            share: newBuyerShare,
            status: 'ACTIVE'
          }
        })
      }

      // Record position history for seller
      await createPositionHistory({
        facilityId: trade.facilityId,
        lenderId: trade.sellerCounterparty.entity.id,
        changeType: 'TRADE',
        previousCommitmentAmount: sellerPosition.commitmentAmount,
        newCommitmentAmount: updatedSellerPosition.commitmentAmount,
        previousUndrawnAmount: sellerPosition.undrawnAmount,
        newUndrawnAmount: updatedSellerPosition.undrawnAmount,
        previousDrawnAmount: sellerPosition.drawnAmount,
        newDrawnAmount: updatedSellerPosition.drawnAmount,
        previousAccruedInterest: 0,
        newAccruedInterest: 0,
        changeAmount: -trade.parAmount,
        userId,
        activityType: 'TRADE',
        tradeId: trade.id,
        notes: `Trade closed - Sold ${trade.parAmount} to ${trade.buyerCounterparty.entity.legalName}`,
        facilityOutstandingAmount: trade.facility.outstandingAmount
      })

      // Record position history for buyer
      await createPositionHistory({
        facilityId: trade.facilityId,
        lenderId: trade.buyerCounterparty.entity.id,
        changeType: 'TRADE',
        previousCommitmentAmount: buyerPosition?.commitmentAmount || 0,
        newCommitmentAmount: updatedBuyerPosition.commitmentAmount,
        previousUndrawnAmount: buyerPosition?.undrawnAmount || 0,
        newUndrawnAmount: updatedBuyerPosition.undrawnAmount,
        previousDrawnAmount: buyerPosition?.drawnAmount || 0,
        newDrawnAmount: updatedBuyerPosition.drawnAmount,
        previousAccruedInterest: 0,
        newAccruedInterest: 0,
        changeAmount: trade.parAmount,
        userId,
        activityType: 'TRADE',
        tradeId: trade.id,
        notes: `Trade closed - Bought ${trade.parAmount} from ${trade.sellerCounterparty.entity.legalName}`,
        facilityOutstandingAmount: trade.facility.outstandingAmount
      })

      // Create transaction history record
      const transaction = await tx.transactionHistory.create({
        data: {
          tradeId: trade.id,
          activityType: 'TRADE_SETTLEMENT',
          amount: trade.parAmount,
          status: 'COMPLETED',
          description: `Trade closed - ${trade.parAmount} transferred from ${trade.sellerCounterparty.entity.legalName} to ${trade.buyerCounterparty.entity.legalName}`,
          effectiveDate: new Date(),
          processedBy: userId,
          facilityOutstandingAmount: trade.facility.outstandingAmount
        }
      })

      // Update trade status to closed
      const closedTrade = await tx.trade.update({
        where: { id: trade.id },
        data: {
          status: 'CLOSED',
          facilityOutstandingAmount: trade.facility.outstandingAmount
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