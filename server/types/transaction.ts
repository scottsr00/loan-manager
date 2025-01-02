import { z } from 'zod'

export const TransactionEventType = {
  PAYDOWN: 'PAYDOWN',
  RATE_RESET: 'RATE_RESET',
  TRADE_SETTLEMENT: 'TRADE_SETTLEMENT',
  LOAN_DRAWDOWN: 'LOAN_DRAWDOWN',
  COMMITMENT_CHANGE: 'COMMITMENT_CHANGE',
  FACILITY_TERMINATION: 'FACILITY_TERMINATION',
  CREDIT_AGREEMENT_AMENDMENT: 'CREDIT_AGREEMENT_AMENDMENT',
  OTHER: 'OTHER'
} as const

export const transactionHistorySchema = z.object({
  type: z.enum([
    'PAYDOWN',
    'RATE_RESET',
    'TRADE_SETTLEMENT',
    'LOAN_DRAWDOWN',
    'COMMITMENT_CHANGE',
    'FACILITY_TERMINATION',
    'CREDIT_AGREEMENT_AMENDMENT',
    'OTHER'
  ]),
  creditAgreementId: z.string().optional(),
  loanId: z.string().optional(),
  tradeId: z.string().optional(),
  servicingActivityId: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  status: z.string().default('PENDING'),
  description: z.string(),
  effectiveDate: z.date(),
  processedBy: z.string(),
  facilityOutstandingAmount: z.number().optional()
})

export type TransactionHistoryInput = z.infer<typeof transactionHistorySchema>

export interface TransactionHistory {
  id: string
  type: keyof typeof TransactionEventType
  creditAgreementId: string | null
  loanId: string | null
  tradeId: string | null
  servicingActivityId: string | null
  amount: number
  currency: string
  status: string
  description: string | null
  effectiveDate: Date
  processedBy: string
  facilityOutstandingAmount: number | null
  createdAt: Date
  updatedAt: Date
  creditAgreement?: {
    agreementNumber: string
  } | null
  loan?: {
    amount: number
  } | null
  trade?: {
    amount: number
    price: number
  } | null
  servicingActivity?: {
    type: string
    description: string | null
  } | null
} 