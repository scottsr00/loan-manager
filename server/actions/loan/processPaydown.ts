'use server'

import { prisma } from '@/server/db/client'
import { type PaydownInput, type PaydownResult, paydownInputSchema } from '@/server/types/servicing'
import { revalidatePath } from 'next/cache'

export async function processPaydown(params: PaydownInput): Promise<PaydownResult> {
  if (!params) {
    throw new Error('Paydown parameters are required')
  }

  try {
    // Validate input
    const validatedParams = paydownInputSchema.parse(params)

    // Start a transaction since we need to update multiple records atomically
    return await prisma.$transaction(async (tx) => {
      // 1. Verify the loan exists and get current amounts
      const loan = await tx.loan.findUnique({
        where: { id: validatedParams.loanId },
        include: {
          positions: true,
          facility: {
            include: {
              positions: true,
              creditAgreement: true
            }
          }
        }
      })

      if (!loan) {
        throw new Error(`Loan with ID ${validatedParams.loanId} not found`)
      }

      if (!loan.facility) {
        throw new Error(`Facility not found for loan ${validatedParams.loanId}`)
      }

      // Calculate total outstanding amount from positions
      const totalOutstanding = loan.positions.reduce((sum: number, pos) => sum + pos.amount, 0)

      if (totalOutstanding < validatedParams.amount) {
        throw new Error(`Paydown amount ${validatedParams.amount} exceeds outstanding balance ${totalOutstanding}`)
      }

      // 2. Calculate new amounts
      const availableAmount = loan.facility.positions.reduce((sum: number, pos) => sum + pos.amount, 0)
      const newAvailableAmount = availableAmount + validatedParams.amount

      // 3. Update loan positions
      const positionUpdates = loan.positions.map(async (position) => {
        const share = position.amount / totalOutstanding // Calculate share based on current position
        const paydownShare = validatedParams.amount * share
        const newAmount = position.amount - paydownShare

        const updatedPosition = await tx.loanPosition.update({
          where: { id: position.id },
          data: { amount: newAmount }
        })

        return {
          lenderId: position.lenderId,
          previousAmount: position.amount,
          newAmount: updatedPosition.amount,
          share: share * 100 // Convert to percentage
        }
      })

      // 4. Update facility positions
      await Promise.all(loan.facility.positions.map(async (position) => {
        const share = position.amount / availableAmount
        const increaseShare = validatedParams.amount * share
        await tx.facilityPosition.update({
          where: { id: position.id },
          data: { amount: position.amount + increaseShare }
        })
      }))

      // 5. Create servicing activity record
      const servicingActivity = await tx.servicingActivity.create({
        data: {
          facilityId: validatedParams.facilityId,
          activityType: 'PRINCIPAL_PAYMENT',
          amount: validatedParams.amount,
          dueDate: validatedParams.paymentDate,
          description: validatedParams.description || `Principal payment of ${validatedParams.amount}`,
          status: 'COMPLETED',
          completedAt: new Date(),
          completedBy: 'SYSTEM'
        }
      })

      // 6. Create transaction history record
      const transactionHistory = await tx.transactionHistory.create({
        data: {
          creditAgreementId: loan.facility.creditAgreementId,
          loanId: validatedParams.loanId,
          servicingActivityId: servicingActivity.id,
          activityType: 'PRINCIPAL_PAYMENT',
          amount: validatedParams.amount,
          currency: loan.currency,
          status: 'COMPLETED',
          description: validatedParams.description || `Principal payment of ${validatedParams.amount}`,
          effectiveDate: validatedParams.paymentDate,
          processedBy: 'SYSTEM'
        }
      })

      // 7. Wait for all position updates to complete
      const updatedPositions = await Promise.all(positionUpdates)

      // Revalidate the servicing and transactions pages to reflect the changes
      revalidatePath('/servicing')
      revalidatePath('/transactions')

      // Get the updated loan for the response
      const updatedLoan = await tx.loan.findUnique({
        where: { id: validatedParams.loanId },
        include: { positions: true }
      })

      if (!updatedLoan) {
        throw new Error('Failed to fetch updated loan')
      }

      const newTotalOutstanding = updatedLoan.positions.reduce((sum: number, pos) => sum + pos.amount, 0)

      return {
        success: true,
        loan: {
          id: updatedLoan.id,
          previousOutstandingAmount: totalOutstanding,
          newOutstandingAmount: newTotalOutstanding,
          lenderPositions: updatedPositions
        },
        facility: {
          id: loan.facility.id,
          previousAvailableAmount: availableAmount,
          newAvailableAmount: newAvailableAmount
        },
        servicingActivity: {
          id: servicingActivity.id,
          activityType: servicingActivity.activityType,
          amount: servicingActivity.amount,
          status: servicingActivity.status,
          completedAt: servicingActivity.completedAt!
        }
      }
    })
  } catch (error) {
    console.error('Error processing paydown:', error instanceof Error ? error.message : 'Unknown error')
    throw error instanceof Error ? error : new Error('Failed to process paydown')
  }
} 