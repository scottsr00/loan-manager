import { z } from 'zod'

export const paydownInputSchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
  facilityId: z.string().min(1, 'Facility ID is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  paymentDate: z.date(),
  description: z.string().optional(),
  servicingActivityId: z.string().optional(),
})

export type PaydownInput = z.infer<typeof paydownInputSchema>

export interface PaydownResult {
  success: boolean
  loan: {
    id: string
    previousOutstandingAmount: number
    newOutstandingAmount: number
    lenderPositions: {
      lenderId: string
      previousAmount: number
      newAmount: number
      share: number
    }[]
  }
  facility: {
    id: string
    previousAvailableAmount: number
    newAvailableAmount: number
  }
  servicingActivity: {
    id: string
    activityType: string
    amount: number
    status: string
    completedAt: Date
  }
} 