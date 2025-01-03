'use server'

import { z } from 'zod'
import { prisma } from '@/server/db/client'
import { revalidatePath } from 'next/cache'
import { type Prisma } from '@prisma/client'

const UpdateLoanSchema = z.object({
  id: z.string().min(1, 'Loan ID is required'),
  amount: z.number().positive('Amount must be positive').optional(),
  status: z.enum(['ACTIVE', 'PARTIALLY_PAID', 'PAID', 'DEFAULTED', 'CLOSED']).optional(),
  positions: z.array(z.object({
    id: z.string().min(1, 'Position ID is required'),
    amount: z.number().positive('Position amount must be positive'),
    status: z.enum(['ACTIVE', 'CLOSED', 'DEFAULTED'])
  })).optional()
})

type UpdateLoanInput = z.infer<typeof UpdateLoanSchema>

export async function updateLoan(params: UpdateLoanInput) {
  try {
    // Validate input data
    const validatedData = UpdateLoanSchema.parse(params)

    // First check if the loan exists
    const existingLoan = await prisma.loan.findUnique({
      where: { id: validatedData.id },
      include: {
        facility: {
          include: {
            creditAgreement: true
          }
        }
      }
    })

    if (!existingLoan) {
      throw new Error('Loan not found')
    }

    // Validate status transitions
    if (validatedData.status) {
      if (existingLoan.status === 'CLOSED' && validatedData.status !== 'CLOSED') {
        throw new Error('Cannot reactivate closed loan')
      }
      if (existingLoan.status === 'PAID' && !['PAID', 'CLOSED'].includes(validatedData.status)) {
        throw new Error('Cannot change status of paid loan except to closed')
      }
    }

    // Validate amount
    if (validatedData.amount !== undefined) {
      if (validatedData.amount > existingLoan.amount) {
        throw new Error('Amount cannot exceed original loan amount')
      }
      if (validatedData.amount < existingLoan.outstandingAmount) {
        throw new Error('Amount cannot be less than outstanding amount')
      }
    }

    // Validate positions if provided
    if (validatedData.positions) {
      const totalPositionAmount = validatedData.positions.reduce((sum, pos) => sum + pos.amount, 0)
      if (totalPositionAmount !== (validatedData.amount || existingLoan.amount)) {
        throw new Error('Position amounts must equal loan amount')
      }
    }

    // Update the loan
    const updatedLoan = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const loan = await tx.loan.update({
        where: { id: validatedData.id },
        data: {
          amount: validatedData.amount,
          status: validatedData.status
        },
        include: {
          facility: {
            include: {
              creditAgreement: true
            }
          }
        }
      })

      // Create transaction history record
      await tx.transactionHistory.create({
        data: {
          loanId: loan.id,
          creditAgreementId: loan.facility.creditAgreement.id,
          activityType: 'LOAN_UPDATE',
          amount: validatedData.amount || loan.amount,
          currency: loan.currency,
          status: 'COMPLETED',
          description: `Loan updated: ${Object.keys(validatedData).filter(k => k !== 'id').join(', ')}`,
          effectiveDate: new Date(),
          processedBy: 'SYSTEM',
          updatedAt: new Date()
        }
      })

      return loan
    })

    revalidatePath('/loans')
    revalidatePath('/servicing')

    return updatedLoan
  } catch (error) {
    console.error('Error updating loan:', error instanceof Error ? error.message : 'Unknown error')
    throw error instanceof Error ? error : new Error('Failed to update loan')
  }
} 