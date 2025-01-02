'use server'

import { prisma } from '@/server/db/client'
import { type PaydownInput, type PaydownResult, paydownInputSchema } from '@/server/types/servicing'
import { revalidatePath } from 'next/cache'
import type { PrismaClient } from '@prisma/client'

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>

export async function processPaydown(params: PaydownInput): Promise<PaydownResult> {
  if (!params) {
    throw new Error('Paydown parameters are required')
  }

  try {
    // Validate input
    const validatedParams = paydownInputSchema.parse(params)

    // Start a transaction since we need to update multiple records atomically
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // 1. Verify the loan exists and get current amounts
      const loan = await tx.loan.findUnique({
        where: { id: validatedParams.loanId },
        include: {
          facility: {
            include: {
              positions: {
                include: {
                  lender: {
                    include: {
                      entity: true
                    }
                  }
                }
              },
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

      if (loan.outstandingAmount < validatedParams.amount) {
        throw new Error(`Paydown amount ${validatedParams.amount} exceeds outstanding balance ${loan.outstandingAmount}`)
      }

      // 2. Calculate new amounts
      const availableAmount = loan.facility.positions.reduce((sum: number, pos) => sum + pos.amount, 0)
      const newAvailableAmount = availableAmount - validatedParams.amount

      // 3. Update loan outstanding amount
      const updatedLoan = await tx.loan.update({
        where: { id: loan.id },
        data: { 
          outstandingAmount: loan.outstandingAmount - validatedParams.amount 
        }
      })

      // 4. Update facility positions and create position history records
      const positionUpdates = await Promise.all(loan.facility.positions.map(async (position) => {
        const share = position.amount / availableAmount
        const decreaseShare = validatedParams.amount * share
        const newAmount = position.amount - decreaseShare

        const updatedPosition = await tx.facilityPosition.update({
          where: { id: position.id },
          data: { amount: newAmount }
        })

        // Create position history record
        await tx.lenderPositionHistory.create({
          data: {
            facilityId: loan.facility!.id,
            lenderId: position.lender.entity.id,
            changeType: 'PAYDOWN',
            previousOutstandingAmount: position.amount,
            newOutstandingAmount: newAmount,
            previousAccruedInterest: 0, // TODO: Track accrued interest
            newAccruedInterest: 0,
            changeAmount: decreaseShare,
            userId: 'SYSTEM',
            notes: `Principal payment of ${formatAmount(decreaseShare)} (${(share * 100).toFixed(2)}% of ${formatAmount(validatedParams.amount)})`
          }
        })

        return {
          lenderId: position.lender.entity.id,
          previousAmount: position.amount,
          newAmount: updatedPosition.amount,
          share: share * 100 // Convert to percentage
        }
      }))

      // 5. Create servicing activity record ONLY if not already linked to one
      let servicingActivity;
      if (!params.servicingActivityId) {
        servicingActivity = await tx.servicingActivity.create({
          data: {
            facilityId: validatedParams.facilityId,
            activityType: 'PRINCIPAL_PAYMENT',
            amount: validatedParams.amount,
            dueDate: validatedParams.paymentDate,
            description: validatedParams.description || `Principal payment of ${formatAmount(validatedParams.amount)}`,
            status: 'COMPLETED',
            completedAt: new Date(),
            completedBy: 'SYSTEM'
          }
        })
      } else {
        servicingActivity = await tx.servicingActivity.findUnique({
          where: { id: params.servicingActivityId }
        })
      }

      if (!servicingActivity) {
        throw new Error('Failed to find or create servicing activity')
      }

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
          description: validatedParams.description || `Principal payment of ${formatAmount(validatedParams.amount)}`,
          effectiveDate: validatedParams.paymentDate,
          processedBy: 'SYSTEM'
        }
      })

      // Revalidate the servicing and transactions pages to reflect the changes
      revalidatePath('/servicing')
      revalidatePath('/transactions')

      return {
        success: true,
        loan: {
          id: updatedLoan.id,
          previousOutstandingAmount: loan.outstandingAmount,
          newOutstandingAmount: updatedLoan.outstandingAmount,
          lenderPositions: positionUpdates
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

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
} 