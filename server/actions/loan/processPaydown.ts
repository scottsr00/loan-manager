'use server'

import { prisma } from '@/server/db/client'
import { type PaydownInput, type PaydownResult, paydownInputSchema } from '@/server/types/servicing'
import { revalidatePath } from 'next/cache'
import type { PrismaClient } from '@prisma/client'

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>

interface FacilityPosition {
  id: string
  amount: number
  commitmentAmount: number
  lender: {
    entity: {
      id: string
    }
  }
}

interface Facility {
  id: string
  creditAgreementId: string
  positions: FacilityPosition[]
  facilityType: {
    name: string
  }
}

interface Loan {
  id: string
  outstandingAmount: number
  currency: string
  facility: Facility
}

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
              creditAgreement: true,
              facilityType: true
            }
          }
        }
      }) as Loan | null

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
      const availableAmount = loan.facility.positions.reduce((sum: number, pos: FacilityPosition) => sum + pos.amount, 0)
      const newAvailableAmount = availableAmount - validatedParams.amount

      // Check if we should reduce commitment (for non-revolvers)
      const isRevolver = loan.facility.facilityType.name === 'REVOLVER'

      // 3. Update loan outstanding amount and facility positions
      const updatedLoan = await tx.loan.update({
        where: { id: loan.id },
        data: { 
          outstandingAmount: loan.outstandingAmount - validatedParams.amount 
        }
      })

      // Update facility positions
      await Promise.all(loan.facility.positions.map(async (position: FacilityPosition) => {
        const share = position.amount / availableAmount
        const changeAmount = validatedParams.amount * share
        const newAmount = position.amount - changeAmount

        await tx.facilityPosition.update({
          where: { id: position.id },
          data: { 
            amount: newAmount,
            // For non-revolvers, reduce the commitment by the same amount
            ...(isRevolver ? {} : { commitmentAmount: position.commitmentAmount - changeAmount })
          }
        })
      }))

      // 4. Create servicing activity record ONLY if not already linked to one
      let servicingActivity;
      if (!params.servicingActivityId) {
        servicingActivity = await tx.servicingActivity.create({
          data: {
            facilityId: validatedParams.facilityId,
            activityType: 'PRINCIPAL_PAYMENT',
            amount: validatedParams.amount,
            dueDate: validatedParams.paymentDate,
            description: validatedParams.description || `Principal payment of ${formatAmount(validatedParams.amount)}`,
            status: 'PENDING',
            completedAt: null,
            completedBy: null
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

      // 5. Create transaction history record
      const transactionHistory = await tx.transactionHistory.create({
        data: {
          creditAgreementId: loan.facility.creditAgreementId,
          loanId: validatedParams.loanId,
          servicingActivityId: servicingActivity.id,
          activityType: 'PRINCIPAL_PAYMENT',
          amount: validatedParams.amount,
          currency: loan.currency,
          status: 'PENDING',
          description: validatedParams.description || `Principal payment of ${formatAmount(validatedParams.amount)}`,
          effectiveDate: validatedParams.paymentDate,
          processedBy: 'SYSTEM'
        }
      })

      // Revalidate the servicing and transactions pages to reflect the changes
      revalidatePath('/servicing')
      revalidatePath('/transactions')

      // 6. Calculate position updates for the response
      const positionUpdates = loan.facility.positions.map((position: FacilityPosition) => {
        const share = position.amount / availableAmount
        const changeAmount = validatedParams.amount * share
        return {
          lenderId: position.lender.entity.id,
          previousAmount: position.amount,
          newAmount: position.amount - changeAmount,
          share: share * 100 // Convert to percentage
        }
      })

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