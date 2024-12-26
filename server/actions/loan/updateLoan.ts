'use server'

import { prisma } from '@/server/db/client'
import { revalidatePath } from 'next/cache'

interface UpdateLoanParams {
  id: string
  amount?: number
  status?: string
}

export async function updateLoan(params: UpdateLoanParams) {
  try {
    // First check if the loan exists
    const existingLoan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: {
        positions: true,
        facility: true
      }
    })

    if (!existingLoan) {
      throw new Error('Loan not found')
    }

    // Validate status transitions
    if (params.status) {
      if (existingLoan.status === 'CLOSED' && params.status !== 'CLOSED') {
        throw new Error('Cannot reactivate closed loan')
      }
    }

    // Validate amount
    if (params.amount !== undefined) {
      if (params.amount > existingLoan.amount) {
        throw new Error('Amount cannot exceed original loan amount')
      }
    }

    // Update the loan
    const updatedLoan = await prisma.loan.update({
      where: { id: params.id },
      data: {
        amount: params.amount,
        status: params.status
      },
      include: {
        positions: true,
        facility: true
      }
    })

    revalidatePath('/loans')
    revalidatePath('/servicing')

    return updatedLoan
  } catch (error) {
    console.error('Error updating loan:', error instanceof Error ? error.message : 'Unknown error')
    throw error instanceof Error ? error : new Error('Failed to update loan')
  }
} 