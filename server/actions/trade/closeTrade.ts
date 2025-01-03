'use server'

import { prisma } from '@/lib/prisma'
import { createFacilityPositionHistory } from '../facility/facilityPositionHistory'
import { type PrismaTransaction } from '@/server/types/trade'
import { PositionChangeType, type FacilityPosition } from '@prisma/client'

export async function closeTrade(tradeId: string, userId: string) {
  try {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        facility: {
          include: {
            positions: true
          }
        }
      }
    })

    if (!trade) {
      throw new Error('Trade not found')
    }

    if (trade.status !== 'PENDING') {
      throw new Error('Trade is not in PENDING status')
    }

    // Update trade status and create position history
    await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Update trade status
      await tx.trade.update({
        where: { id: tradeId },
        data: {
          status: 'COMPLETED'
        }
      })

      // Create position history for seller
      const sellerPosition = trade.facility.positions.find(
        (p: FacilityPosition) => p.lenderId === trade.sellerCounterpartyId
      )

      if (sellerPosition) {
        const newCommitmentAmount = sellerPosition.commitmentAmount - trade.parAmount
        const newUndrawnAmount = sellerPosition.undrawnAmount - trade.parAmount
        const newShare = (newCommitmentAmount / trade.facility.commitmentAmount) * 100

        await tx.facilityPosition.update({
          where: { id: sellerPosition.id },
          data: {
            commitmentAmount: newCommitmentAmount,
            undrawnAmount: newUndrawnAmount,
            share: newShare
          }
        })

        await createFacilityPositionHistory({
          facilityId: trade.facilityId,
          lenderId: trade.sellerCounterpartyId,
          changeType: PositionChangeType.TRADE,
          previousCommitmentAmount: sellerPosition.commitmentAmount,
          newCommitmentAmount,
          previousUndrawnAmount: sellerPosition.undrawnAmount,
          newUndrawnAmount,
          previousDrawnAmount: sellerPosition.drawnAmount,
          newDrawnAmount: sellerPosition.drawnAmount,
          previousShare: sellerPosition.share,
          newShare,
          previousStatus: sellerPosition.status,
          newStatus: sellerPosition.status,
          changeAmount: -trade.parAmount,
          userId,
          notes: `Trade ${tradeId} completed - Seller position updated`,
          tradeId
        })
      }

      // Create position history for buyer
      const buyerPosition = trade.facility.positions.find(
        (p: FacilityPosition) => p.lenderId === trade.buyerCounterpartyId
      )

      if (buyerPosition) {
        const newCommitmentAmount = buyerPosition.commitmentAmount + trade.parAmount
        const newUndrawnAmount = buyerPosition.undrawnAmount + trade.parAmount
        const newShare = (newCommitmentAmount / trade.facility.commitmentAmount) * 100

        await tx.facilityPosition.update({
          where: { id: buyerPosition.id },
          data: {
            commitmentAmount: newCommitmentAmount,
            undrawnAmount: newUndrawnAmount,
            share: newShare
          }
        })

        await createFacilityPositionHistory({
          facilityId: trade.facilityId,
          lenderId: trade.buyerCounterpartyId,
          changeType: PositionChangeType.TRADE,
          previousCommitmentAmount: buyerPosition.commitmentAmount,
          newCommitmentAmount,
          previousUndrawnAmount: buyerPosition.undrawnAmount,
          newUndrawnAmount,
          previousDrawnAmount: buyerPosition.drawnAmount,
          newDrawnAmount: buyerPosition.drawnAmount,
          previousShare: buyerPosition.share,
          newShare,
          previousStatus: buyerPosition.status,
          newStatus: buyerPosition.status,
          changeAmount: trade.parAmount,
          userId,
          notes: `Trade ${tradeId} completed - Buyer position updated`,
          tradeId
        })
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error closing trade:', error)
    throw error
  }
} 