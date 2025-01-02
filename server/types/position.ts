import { z } from 'zod'

export const lenderPositionHistorySchema = z.object({
  id: z.string(),
  facilityId: z.string(),
  lenderId: z.string(),
  changeDateTime: z.date(),
  changeType: z.enum(['PAYDOWN', 'ACCRUAL', 'TRADE']),
  previousOutstandingAmount: z.number(),
  newOutstandingAmount: z.number(),
  previousAccruedInterest: z.number(),
  newAccruedInterest: z.number(),
  changeAmount: z.number(),
  userId: z.string(),
  notes: z.string().optional(),
  servicingActivityId: z.string().optional(),
  tradeId: z.string().optional()
})

export type LenderPositionHistory = z.infer<typeof lenderPositionHistorySchema> 