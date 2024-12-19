import { type Prisma, type Trade as PrismaTrade } from '@prisma/client'
import { z } from 'zod'

// Base Prisma Types with Relations
export type TradeWithRelations = Prisma.TradeGetPayload<{
  include: {
    facility: {
      include: {
        creditAgreement: {
          select: {
            agreementName: true
            amount: true
          }
        }
      }
    }
    counterparty: {
      select: {
        legalName: true
      }
    }
    historicalBalances: true
    comments: true
  }
}>

// Input Validation Schemas
export const tradeInputSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  amount: z.number().positive('Amount must be positive'),
  price: z.number().positive('Price must be positive'),
  counterpartyId: z.string().min(1, 'Counterparty is required'),
  tradeDate: z.date(),
  settlementDate: z.date(),
  status: z.enum(['PENDING', 'SETTLED']),
})

export const tradeCommentSchema = z.object({
  tradeId: z.string().min(1, 'Trade ID is required'),
  comment: z.string().min(1, 'Comment content is required')
})

export const tradeHistoricalBalanceSchema = z.object({
  date: z.date(),
  balance: z.number()
})

// Inferred Types from Schemas
export type TradeInput = z.infer<typeof tradeInputSchema>
export type TradeComment = z.infer<typeof tradeCommentSchema>
export type TradeHistoricalBalance = z.infer<typeof tradeHistoricalBalanceSchema>

// Response Types
export interface TradeHistoryItem extends TradeWithRelations {
  id: string
  facilityId: string
  facility: {
    id: string
    creditAgreement: {
      agreementName: string
      amount: number
    }
  }
  counterparty: {
    legalName: string
  }
  amount: number
  price: number
  tradeDate: Date
  settlementDate: Date
  status: string
  comments: TradeComment[]
  historicalBalances: TradeHistoricalBalance[]
  createdAt: Date
  updatedAt: Date
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