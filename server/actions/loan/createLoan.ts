'use server'

import { type Prisma, type Loan } from '@prisma/client'
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

export async function createLoan(params: CreateLoanParams) {
  const { facilityId, amount, currency, effectiveDate, description, interestPeriod, baseRate } = params

  try {
    return await prisma.$transaction(async (tx) => {
      // First verify the facility exists and has enough available amount
      const facility = await tx.facility.findUnique({
        where: { id: facilityId },
        include: {
          loans: true
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
      const totalOutstanding = facility.loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0)
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

      return loan
    })
  } catch (error) {
    console.error('Error creating loan:', error)
    throw error
  }
} 