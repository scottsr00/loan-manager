import { type Prisma, type Trade as PrismaTrade } from '@prisma/client'
import { z } from 'zod'

// Base Prisma Types with Relations
export type TradeWithRelations = Prisma.TradeGetPayload<{
  include: {
    loan: {
      select: {
        dealName: true
        currentBalance: true
      }
    }
    historicalBalances: true
    comments: true
  }
}>

// Input Validation Schemas
export const tradeInputSchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  counterparty: z.string().min(1, 'Counterparty is required'),
  tradeDate: z.date(),
  expectedSettlementDate: z.date(),
  accruedInterest: z.number(),
  status: z.enum(['Open', 'Completed']),
  tradeType: z.enum(['Buy', 'Sell']),
  costOfCarryAccrued: z.number().default(0),
  lastCarryCalculation: z.date().optional()
})

export const tradeCommentSchema = z.object({
  tradeId: z.number().positive('Trade ID is required'),
  content: z.string().min(1, 'Comment content is required')
})

export const tradeHistoricalBalanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  balance: z.number()
})

// Inferred Types from Schemas
export type TradeInput = z.infer<typeof tradeInputSchema>
export type TradeComment = z.infer<typeof tradeCommentSchema>
export type TradeHistoricalBalance = z.infer<typeof tradeHistoricalBalanceSchema>

// Response Types
export interface TradeHistoryItem extends TradeWithRelations {
  counterparty: {
    legalName: string
  }
}

// Full Trade Type matching Prisma schema
export interface Trade extends PrismaTrade {
  id: number
  loanId: string
  quantity: number
  price: number
  counterparty: string
  tradeDate: Date
  expectedSettlementDate: Date
  accruedInterest: number
  status: string
  tradeType: string
  costOfCarryAccrued: number
  lastCarryCalculation: Date | null
  createdAt: Date
  updatedAt: Date
  loan?: {
    dealName: string
    currentBalance: number
  }
  historicalBalances?: TradeHistoricalBalance[]
  comments?: TradeComment[]
} 