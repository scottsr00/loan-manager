import { z } from 'zod'
import { type Prisma } from '@prisma/client'

export const TradeStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SETTLED: 'SETTLED',
  CLOSED: 'CLOSED'
} as const

export const TradeActivityType = {
  TRADE_CREATED: 'TRADE_CREATED',
  TRADE_CONFIRMED: 'TRADE_CONFIRMED',
  TRADE_SETTLED: 'TRADE_SETTLED',
  TRADE_CLOSED: 'TRADE_CLOSED',
  POSITION_UPDATED: 'POSITION_UPDATED'
} as const

export const TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const

export const tradeInputSchema = z.object({
  facilityId: z.string(),
  sellerLenderId: z.string(),
  buyerLenderId: z.string(),
  tradeDate: z.date(),
  settlementDate: z.date(),
  parAmount: z.number().positive(),
  price: z.number().min(0).max(100),
  description: z.string().optional()
})

export const tradeUpdateSchema = z.object({
  id: z.string(),
  status: z.enum([
    TradeStatus.PENDING,
    TradeStatus.CONFIRMED,
    TradeStatus.SETTLED,
    TradeStatus.CLOSED
  ]),
  description: z.string().optional()
})

export type TradeInput = z.infer<typeof tradeInputSchema>
export type TradeUpdate = z.infer<typeof tradeUpdateSchema>

export type TradeTransaction = {
  id: string
  activityType: keyof typeof TradeActivityType
  amount: number
  status: keyof typeof TransactionStatus
  description: string | null
  effectiveDate: Date
  processedBy: string
  createdAt: Date
}

export type TradeWithRelations = {
  id: string
  facilityId: string
  sellerLenderId: string
  buyerLenderId: string
  tradeDate: Date
  settlementDate: Date
  parAmount: number
  price: number
  settlementAmount: number
  status: keyof typeof TradeStatus
  description?: string | null
  createdAt: Date
  updatedAt: Date
  facility: {
    facilityName: string
    currency: string
    creditAgreement: {
      agreementNumber: string
    }
  }
  seller: {
    entity: {
      legalName: string
    }
  }
  buyer: {
    entity: {
      legalName: string
    }
  }
  transactions: TradeTransaction[]
}

// Prisma transaction type for type safety
export type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
> 