'use server'

import { prisma } from '@/server/db/client'
import { type TransactionHistoryInput, transactionHistorySchema } from '@/server/types/transaction'

export async function createTransaction(data: TransactionHistoryInput) {
  try {
    const validatedData = transactionHistorySchema.parse(data)
    
    const transaction = await prisma.transactionHistory.create({
      data: {
        ...validatedData,
        effectiveDate: new Date(validatedData.effectiveDate)
      }
    })

    return transaction
  } catch (error) {
    console.error('Error in createTransaction:', error)
    throw new Error('Failed to create transaction history record')
  }
} 