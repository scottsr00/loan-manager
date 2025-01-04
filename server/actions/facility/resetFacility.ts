'use server'

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function resetFacility(facilityId: string) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get facility to find original lender
      const facility = await tx.facility.findUnique({
        where: { id: facilityId },
        include: {
          creditAgreement: {
            include: {
              lender: true
            }
          }
        }
      })

      if (!facility) {
        throw new Error('Facility not found')
      }

      console.log('Found facility:', {
        facilityId: facility.id,
        facilityName: facility.facilityName,
        commitmentAmount: facility.commitmentAmount,
        creditAgreementId: facility.creditAgreementId,
        originalLenderEntityId: facility.creditAgreement.lender.id
      })

      // Get the Lender record for the original lender entity
      const originalLender = await tx.lender.findFirst({
        where: { entityId: facility.creditAgreement.lender.id }
      })

      if (!originalLender) {
        console.error('Original lender not found for:', {
          facilityId,
          entityId: facility.creditAgreement.lender.id
        })
        throw new Error('Original lender not found')
      }

      console.log('Found original lender:', {
        lenderId: originalLender.id,
        entityId: originalLender.entityId
      })

      // Delete all facility position history records
      const deletedHistory = await tx.facilityPositionHistory.deleteMany({
        where: { facilityId }
      })
      console.log('Deleted position history records:', deletedHistory.count)

      // Delete all servicing activities
      const deletedActivities = await tx.servicingActivity.deleteMany({
        where: { facilityId }
      })
      console.log('Deleted servicing activities:', deletedActivities.count)

      // First delete trade status changes
      const trades = await tx.trade.findMany({
        where: { facilityId },
        select: { id: true }
      })
      
      const tradeIds = trades.map(t => t.id)
      console.log('Found trades to delete:', tradeIds.length)
      
      const deletedStatusChanges = await tx.tradeStatusChange.deleteMany({
        where: { tradeId: { in: tradeIds } }
      })
      console.log('Deleted trade status changes:', deletedStatusChanges.count)

      // Then delete trades
      const deletedTrades = await tx.trade.deleteMany({
        where: { facilityId }
      })
      console.log('Deleted trades:', deletedTrades.count)

      // Delete all loans
      const deletedLoans = await tx.loan.deleteMany({
        where: { facilityId }
      })
      console.log('Deleted loans:', deletedLoans.count)

      // Find original lender's position
      const originalPosition = await tx.facilityPosition.findFirst({
        where: {
          facilityId,
          lenderId: originalLender.id
        }
      })

      if (!originalPosition) {
        console.error('Original position not found for:', {
          facilityId,
          lenderId: originalLender.id
        })
        throw new Error('Original lender position not found')
      }

      console.log('Found original position:', {
        positionId: originalPosition.id,
        lenderId: originalPosition.lenderId,
        currentCommitment: originalPosition.commitmentAmount,
        currentShare: originalPosition.share
      })

      // Delete all facility positions except original lender's
      const deletedPositions = await tx.facilityPosition.deleteMany({
        where: {
          facilityId,
          id: {
            not: originalPosition.id
          }
        }
      })
      console.log('Deleted other positions:', deletedPositions.count)

      // Reset original lender's position to full commitment
      const updatedPosition = await tx.facilityPosition.update({
        where: {
          id: originalPosition.id
        },
        data: {
          commitmentAmount: facility.commitmentAmount,
          drawnAmount: 0,
          undrawnAmount: facility.commitmentAmount,
          share: 100
        }
      })
      console.log('Updated original position:', {
        positionId: updatedPosition.id,
        newCommitment: updatedPosition.commitmentAmount,
        newShare: updatedPosition.share
      })

      // Reset facility amounts
      const updatedFacility = await tx.facility.update({
        where: { id: facilityId },
        data: {
          outstandingAmount: 0,
          availableAmount: facility.commitmentAmount
        }
      })
      console.log('Updated facility:', {
        facilityId: updatedFacility.id,
        newOutstanding: updatedFacility.outstandingAmount,
        newAvailable: updatedFacility.availableAmount
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Error resetting facility:', error)
    throw error
  }
} 