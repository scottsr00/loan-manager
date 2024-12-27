'use server'

import { z } from 'zod'

import { prisma } from '@/server/db/client'

const LoanPositionSchema = z.object({
  lenderId: z.string().min(1, 'Lender ID is required'),
  amount: z.number().positive('Position amount must be positive'),
  status: z.enum(['ACTIVE', 'CLOSED', 'DEFAULTED']).optional().default('ACTIVE')
})

const CreateLoanSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().optional().default('USD'),
  status: z.enum(['ACTIVE', 'PARTIALLY_PAID', 'PAID', 'DEFAULTED', 'CLOSED']).optional().default('ACTIVE'),
  positions: z.array(LoanPositionSchema).min(1, 'At least one position is required')
}).refine(data => {
  const totalPositionAmount = data.positions.reduce((sum, pos) => sum + pos.amount, 0)
  return totalPositionAmount === data.amount
}, {
  message: 'Position amounts must equal loan amount',
  path: ['positions']
})

type CreateLoanInput = z.infer<typeof CreateLoanSchema>

export async function createLoan(data: CreateLoanInput) {
  try {
    // Validate input data
    const validatedData = CreateLoanSchema.parse(data)

    // Create the loan
    const loan = await prisma.loan.create({
      data: {
        facilityId: validatedData.facilityId,
        amount: validatedData.amount,
        outstandingAmount: validatedData.amount,
        currency: validatedData.currency,
        status: validatedData.status,
        positions: {
          create: validatedData.positions.map(position => ({
            lenderId: position.lenderId,
            amount: position.amount,
            status: position.status
          }))
        }
      },
      include: {
        positions: true,
        facility: true
      }
    })

    return loan
  } catch (error) {
    console.error('Error creating loan:', error)
    throw error instanceof Error ? error : new Error('Failed to create loan')
  }
} 