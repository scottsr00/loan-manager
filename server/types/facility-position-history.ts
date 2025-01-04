import { z } from 'zod'
import { FacilityPositionStatus } from './facility-position'

export const facilityPositionHistorySchema = z.object({
  id: z.string(),
  facilityId: z.string(),
  lenderId: z.string(),
  changeDateTime: z.date(),
  changeType: z.enum(['PAYDOWN', 'ACCRUAL', 'TRADE', 'COMMITMENT_CHANGE']),
  previousCommitmentAmount: z.number(),
  newCommitmentAmount: z.number(),
  previousUndrawnAmount: z.number(),
  newUndrawnAmount: z.number(),
  previousDrawnAmount: z.number(),
  newDrawnAmount: z.number(),
  previousShare: z.number(),
  newShare: z.number(),
  previousStatus: z.nativeEnum(FacilityPositionStatus),
  newStatus: z.nativeEnum(FacilityPositionStatus),
  changeAmount: z.number(),
  userId: z.string(),
  notes: z.string().optional(),
  servicingActivityId: z.string().optional(),
  tradeId: z.string().optional()
})

export type FacilityPositionHistory = z.infer<typeof facilityPositionHistorySchema>

export interface FacilityPositionHistoryView {
  id: string
  facilityName: string
  lenderName: string
  changeDateTime: Date
  changeType: string
  previousAmount: number
  newAmount: number
  previousShare: number
  newShare: number
  previousStatus: FacilityPositionStatus
  newStatus: FacilityPositionStatus
  changeAmount: number
  notes?: string
  servicingActivity?: {
    id: string
    activityType: string
    dueDate: Date
    amount: number
    status: string
  }
  trade?: {
    id: string
    counterparty: string
    amount: number
    price: number
    status: string
    tradeDate: Date
    settlementDate: Date
  }
} 