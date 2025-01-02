import { z } from 'zod'

export const PositionChangeType = {
  PAYDOWN: 'PAYDOWN',
  ACCRUAL: 'ACCRUAL',
  TRADE: 'TRADE'
} as const

export const lenderPositionHistorySchema = z.object({
  facilityId: z.string(),
  lenderId: z.string(),
  changeType: z.enum(['PAYDOWN', 'ACCRUAL', 'TRADE']),
  previousOutstandingAmount: z.number(),
  newOutstandingAmount: z.number(),
  previousAccruedInterest: z.number(),
  newAccruedInterest: z.number(),
  changeAmount: z.number(),
  userId: z.string(),
  notes: z.string().optional()
})

export type LenderPositionHistoryInput = z.infer<typeof lenderPositionHistorySchema>

export interface LenderPositionHistory {
  id: string
  facilityId: string
  lenderId: string
  changeDateTime: Date
  changeType: keyof typeof PositionChangeType
  previousOutstandingAmount: number
  newOutstandingAmount: number
  previousAccruedInterest: number
  newAccruedInterest: number
  changeAmount: number
  userId: string
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  facility: {
    facilityName: string
    currency: string
  }
  lender: {
    legalName: string
  }
} 