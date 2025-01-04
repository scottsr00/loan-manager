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
        }
      }
    })

    if (!trade) {
      throw new Error('Trade not found')
    }

    if (trade.status !== 'SETTLED') {
      throw new Error('Trade must be in SETTLED status to close')
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

      // Get or create lender records for both counterparties
      const sellerLender = await tx.lender.upsert({
        where: { entityId: trade.sellerCounterparty.entity.id },
        create: { entityId: trade.sellerCounterparty.entity.id, status: 'ACTIVE' },
        update: {}
      })

      const buyerLender = await tx.lender.upsert({
        where: { entityId: trade.buyerCounterparty.entity.id },
        create: { entityId: trade.buyerCounterparty.entity.id, status: 'ACTIVE' },
        update: {}
      })

      // Find positions
      const sellerPosition = trade.facility.positions.find(
        (p: FacilityPosition) => p.lenderId === sellerLender.id
      )

      let buyerPosition = trade.facility.positions.find(
        (p: FacilityPosition) => p.lenderId === buyerLender.id
      )

      // Store buyer's previous values before any updates
      const buyerPreviousCommitment = buyerPosition?.commitmentAmount ?? 0
      const buyerPreviousDrawn = buyerPosition?.drawnAmount ?? 0
      const buyerPreviousShare = buyerPosition?.share ?? 0
      const buyerPreviousStatus = buyerPosition?.status || 'ACTIVE'
      const buyerNewCommitment = buyerPreviousCommitment + trade.parAmount
      const buyerNewDrawn = buyerPreviousDrawn + trade.parAmount
      const buyerNewShare = (buyerNewCommitment / trade.facility.commitmentAmount) * 100

      // Update seller position first
      if (sellerPosition) {
        const newCommitmentAmount = sellerPosition.commitmentAmount - trade.parAmount
        const newDrawnAmount = sellerPosition.drawnAmount - trade.parAmount
        // Calculate share based on total facility commitment
        const newShare = (newCommitmentAmount / trade.facility.commitmentAmount) * 100

        await tx.facilityPosition.update({
          where: { id: sellerPosition.id },
          data: {
            commitmentAmount: newCommitmentAmount,
            drawnAmount: newDrawnAmount,
            undrawnAmount: 0,
            share: newShare
          }
        })
      }

      // Create or update buyer position
      if (!buyerPosition) {
        const newShare = (trade.parAmount / trade.facility.commitmentAmount) * 100
        buyerPosition = await tx.facilityPosition.create({
          data: {
            facilityId: trade.facilityId,
            lenderId: buyerLender.id,
            commitmentAmount: trade.parAmount,
            drawnAmount: trade.parAmount,
            undrawnAmount: 0,
            share: newShare,
            status: 'ACTIVE'
          }
        })
      } else {
        const newCommitmentAmount = buyerPosition.commitmentAmount + trade.parAmount
        const newDrawnAmount = buyerPosition.drawnAmount + trade.parAmount
        const newShare = (newCommitmentAmount / trade.facility.commitmentAmount) * 100

        await tx.facilityPosition.update({
          where: { id: buyerPosition.id },
          data: {
            commitmentAmount: newCommitmentAmount,
            drawnAmount: newDrawnAmount,
            undrawnAmount: 0,
            share: newShare
          }
        })
      }

      // Now create position histories after all position updates
      if (sellerPosition) {
        const newCommitmentAmount = sellerPosition.commitmentAmount - trade.parAmount
        const newDrawnAmount = sellerPosition.drawnAmount - trade.parAmount
        const newShare = (newCommitmentAmount / trade.facility.commitmentAmount) * 100

        console.log('Seller position history values:', {
          previousCommitmentAmount: sellerPosition.commitmentAmount,
          newCommitmentAmount,
          previousDrawnAmount: sellerPosition.drawnAmount,
          newDrawnAmount,
          previousShare: sellerPosition.share,
          newShare,
          facilityCommitment: trade.facility.commitmentAmount
        })

        await tx.facilityPositionHistory.create({
          data: {
            facilityId: trade.facilityId,
            lenderId: sellerLender.id,
            changeType: PositionChangeType.TRADE,
            previousCommitmentAmount: sellerPosition.commitmentAmount,
            newCommitmentAmount,
            previousUndrawnAmount: 0,
            newUndrawnAmount: 0,
            previousDrawnAmount: sellerPosition.drawnAmount,
            newDrawnAmount,
            previousShare: sellerPosition.share,
            newShare,
            previousStatus: sellerPosition.status,
            newStatus: sellerPosition.status,
            changeAmount: -trade.parAmount,
            userId,
            notes: `Trade ${tradeId} completed - Seller position updated`,
            tradeId
          }
        })
      }

      console.log('Buyer position history values:', {
        previousCommitmentAmount: buyerPreviousCommitment,
        newCommitmentAmount: buyerNewCommitment,
        previousDrawnAmount: buyerPreviousDrawn,
        newDrawnAmount: buyerNewDrawn,
        previousShare: buyerPreviousShare,
        newShare: buyerNewShare,
        buyerPosition: buyerPosition ? {
          commitmentAmount: buyerPosition.commitmentAmount,
          drawnAmount: buyerPosition.drawnAmount,
          share: buyerPosition.share
        } : null,
        facilityCommitment: trade.facility.commitmentAmount
      })

      // Create position history for buyer
      await tx.facilityPositionHistory.create({
        data: {
          facilityId: trade.facilityId,
          lenderId: buyerLender.id,
          changeType: PositionChangeType.TRADE,
          previousCommitmentAmount: buyerPreviousCommitment,
          newCommitmentAmount: buyerNewCommitment,
          previousUndrawnAmount: 0,
          newUndrawnAmount: 0,
          previousDrawnAmount: buyerPreviousDrawn,
          newDrawnAmount: buyerNewDrawn,
          previousShare: buyerPreviousShare,
          newShare: buyerNewShare,
          previousStatus: buyerPreviousStatus,
          newStatus: 'ACTIVE',
          changeAmount: trade.parAmount,
          userId,
          notes: `Trade ${tradeId} completed - Buyer position updated`,
          tradeId
        }
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Error closing trade:', error)
    throw error
  }
} 