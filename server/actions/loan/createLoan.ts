'use server'

import { type Prisma, type PrismaClient, type Loan, type FacilityPosition, type Lender, type Entity, PositionChangeType } from '@prisma/client'
import { prisma } from '@/server/db/client'

interface CreateLoanParams {
  facilityId: string
  amount: number
  currency: string
  effectiveDate: Date
  description?: string
  interestPeriod: '1M' | '3M'
  baseRate: number
  effectiveRate?: number
}

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>

type FacilityPositionWithRelations = FacilityPosition & {
  lender: Lender & {
    entity: Entity
  }
}

export async function createLoan(params: CreateLoanParams) {
  const { facilityId, amount, currency, effectiveDate, description, interestPeriod, baseRate } = params

  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // First verify the facility exists and has enough available amount
      const facility = await tx.facility.findUnique({
        where: { id: facilityId },
        include: {
          loans: true,
          positions: {
            include: {
              lender: {
                include: {
                  entity: true
                }
              }
            }
          }
        }
      })

      if (!facility) {
        throw new Error('Facility not found')
      }

      // Validate currency matches facility
      if (currency !== facility.currency) {
        throw new Error('Currency mismatch')
      }

      // Calculate total outstanding loans
      const totalOutstanding = facility.loans.reduce((sum: number, loan: Loan) => sum + loan.outstandingAmount, 0)
      const availableAmount = facility.commitmentAmount - totalOutstanding

      if (amount > availableAmount) {
        throw new Error(`Insufficient available amount. Available: ${availableAmount}, Requested: ${amount}`)
      }

      // Parse and validate rates
      const parsedBaseRate = Number(baseRate.toFixed(5))
      if (isNaN(parsedBaseRate)) {
        throw new Error('Invalid base rate')
      }

      // Calculate effective rate (baseRate + facility margin)
      const calculatedEffectiveRate = Number((parsedBaseRate + facility.margin).toFixed(5))

      // Validate effective rate matches provided rate if one was given
      if (params.effectiveRate !== undefined) {
        const parsedEffectiveRate = Number(params.effectiveRate.toFixed(5))
        if (Math.abs(parsedEffectiveRate - calculatedEffectiveRate) > 0.00001) { // Allow for small floating point differences
          throw new Error(`Effective rate mismatch. Calculated: ${calculatedEffectiveRate}, Provided: ${parsedEffectiveRate}`)
        }
      }

      // Create the loan with all required fields
      const loan = await tx.loan.create({
        data: {
          facilityId,
          amount,
          outstandingAmount: amount,
          currency,
          status: 'ACTIVE',
          interestPeriod,
          drawDate: effectiveDate,
          baseRate: parsedBaseRate,
          effectiveRate: calculatedEffectiveRate,
          updatedAt: new Date()
        }
      })

      // Update facility positions and create position history records
      await Promise.all(facility.positions.map(async (position) => {
        // Calculate position's share of the draw based on their share percentage
        const drawShare = position.share / 100 * amount

        // Get current position with all fields
        const currentPosition = await tx.facilityPosition.findUnique({
          where: { id: position.id },
          include: {
            lender: {
              include: {
                entity: true
              }
            }
          }
        })

        if (!currentPosition) {
          throw new Error(`Position ${position.id} not found`)
        }

        // Calculate new amounts
        const newDrawnAmount = position.drawnAmount + drawShare
        const newUndrawnAmount = position.undrawnAmount - drawShare

        // Update position amounts
        await tx.facilityPosition.update({
          where: { id: position.id },
          data: {
            drawnAmount: newDrawnAmount,
            undrawnAmount: newUndrawnAmount
          }
        })

        // Create position history record
        await tx.lenderPositionHistory.create({
          data: {
            facilityId,
            lenderId: currentPosition.lender.entity.id,  // Use the entity ID instead of lender ID
            changeType: PositionChangeType.DRAWDOWN,
            changeAmount: drawShare,
            userId: 'SYSTEM',
            notes: description || 'Initial loan drawdown',
            previousCommitmentAmount: position.commitmentAmount,
            newCommitmentAmount: position.commitmentAmount,
            previousUndrawnAmount: position.undrawnAmount,
            newUndrawnAmount: newUndrawnAmount,
            previousDrawnAmount: position.drawnAmount,
            newDrawnAmount: newDrawnAmount,
            previousAccruedInterest: 0,
            newAccruedInterest: 0
          }
        })
      }))

      // Create a transaction record
      await tx.transactionHistory.create({
        data: {
          loanId: loan.id,
          activityType: 'LOAN_DRAWDOWN',
          amount,
          currency,
          status: 'COMPLETED',
          description: description || 'Initial loan drawdown',
          effectiveDate,
          processedBy: 'SYSTEM',
          updatedAt: new Date()
        }
      })

      // Record the drawdown as a servicing activity
      await tx.servicingActivity.create({
        data: {
          facilityId,
          activityType: 'DRAWDOWN',
          dueDate: effectiveDate,
          description: description || 'Initial loan drawdown',
          amount,
          status: 'COMPLETED'
        }
      })

      return loan
    })
  } catch (error) {
    console.error('Error creating loan:', error)
    throw error
  }
} 