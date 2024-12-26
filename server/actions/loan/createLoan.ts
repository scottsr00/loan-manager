'use server'

import { prisma } from '@/server/db/client'

interface CreateLoanInput {
  facilityId: string
  amount: number
  currency?: string
  status?: string
  positions: {
    lenderId: string
    amount: number
    status?: string
  }[]
}

export async function createLoan(data: CreateLoanInput) {
  try {
    // Validate required fields
    if (!data.facilityId) {
      throw new Error('Facility ID is required')
    }
    if (data.amount <= 0) {
      throw new Error('Amount must be positive')
    }
    if (!data.positions || data.positions.length === 0) {
      throw new Error('At least one position is required')
    }

    // Validate position amounts
    const totalPositionAmount = data.positions.reduce((sum, pos) => sum + pos.amount, 0)
    if (totalPositionAmount !== data.amount) {
      throw new Error('Position amounts must equal loan amount')
    }

    // Create the loan
    const loan = await prisma.loan.create({
      data: {
        facilityId: data.facilityId,
        amount: data.amount,
        currency: data.currency || 'USD',
        status: data.status || 'ACTIVE',
        positions: {
          create: data.positions.map(position => ({
            lenderId: position.lenderId,
            amount: position.amount,
            status: position.status || 'ACTIVE'
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