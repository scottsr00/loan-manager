'use server'

import { prisma } from '@/server/db/client'
import { type PaydownInput, type PaydownResult } from '@/server/types/servicing'
import { revalidatePath } from 'next/cache'

export async function processPaydown(params: PaydownInput): Promise<PaydownResult> {
  try {
    // Start a transaction since we need to update multiple records atomically
    return await prisma.$transaction(async (tx) => {
      // 1. Verify the loan exists and get current amounts
      const loan = await tx.loan.findUnique({
        where: { id: params.loanId },
        include: {
          loanPositions: true,
          facility: {
            include: {
              creditAgreement: true
            }
          },
        },
      })

      if (!loan) {
        throw new Error('Loan not found')
      }

      if (loan.outstandingAmount < params.amount) {
        throw new Error('Paydown amount exceeds outstanding balance')
      }

      // 2. Calculate new amounts
      const newOutstandingAmount = loan.outstandingAmount - params.amount
      const newAvailableAmount = loan.facility.availableAmount + params.amount

      // 3. Update loan positions
      const lenderPositionUpdates = loan.loanPositions.map(async (position) => {
        const share = position.share / 100 // Convert percentage to decimal
        const paydownShare = params.amount * share
        const newAmount = position.amount - paydownShare

        const updatedPosition = await tx.loanPosition.update({
          where: { id: position.id },
          data: { amount: newAmount }
        })

        return {
          lenderId: position.lenderId,
          previousAmount: position.amount,
          newAmount: updatedPosition.amount,
          share: position.share
        }
      })

      // 4. Update loan outstanding amount
      const updatedLoan = await tx.loan.update({
        where: { id: params.loanId },
        data: { outstandingAmount: newOutstandingAmount }
      })

      // 5. Update facility available amount
      const updatedFacility = await tx.facility.update({
        where: { id: params.facilityId },
        data: { availableAmount: newAvailableAmount }
      })

      // 6. Create servicing activity record
      const servicingActivity = await tx.servicingActivity.create({
        data: {
          facilityId: params.facilityId,
          activityType: 'PRINCIPAL_PAYMENT',
          amount: params.amount,
          dueDate: params.paymentDate,
          description: params.description || `Principal payment of ${params.amount}`,
          status: 'COMPLETED',
          completedAt: new Date(),
        }
      })

      // 7. Create transaction history record
      const transaction = await tx.transactionHistory.create({
        data: {
          eventType: 'PAYDOWN',
          facilityId: params.facilityId,
          creditAgreementId: loan.facility.creditAgreementId,
          loanId: params.loanId,
          servicingActivityId: servicingActivity.id,
          balanceChange: -params.amount,
          description: params.description || `Principal payment of ${params.amount}`,
          effectiveDate: params.paymentDate,
          processedBy: 'Current User' // TODO: Replace with actual user
        }
      })

      // 8. Wait for all lender position updates to complete
      const updatedPositions = await Promise.all(lenderPositionUpdates)

      // Revalidate the servicing and transactions pages to reflect the changes
      revalidatePath('/servicing')
      revalidatePath('/transactions')

      return {
        success: true,
        loan: {
          id: loan.id,
          previousOutstandingAmount: loan.outstandingAmount,
          newOutstandingAmount: updatedLoan.outstandingAmount,
          lenderPositions: updatedPositions
        },
        facility: {
          id: updatedFacility.id,
          previousAvailableAmount: loan.facility.availableAmount,
          newAvailableAmount: updatedFacility.availableAmount
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
    console.error('Error processing paydown:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to process paydown')
  }
} 