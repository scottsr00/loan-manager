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
  eventType: z.enum([
    'PAYDOWN',
    'RATE_RESET',
    'TRADE_SETTLEMENT',
    'LOAN_DRAWDOWN',
    'COMMITMENT_CHANGE',
    'FACILITY_TERMINATION',
    'CREDIT_AGREEMENT_AMENDMENT',
    'OTHER'
  ]),
  facilityId: z.string(),
  creditAgreementId: z.string().optional(),
  loanId: z.string().optional(),
  tradeId: z.string().optional(),
  servicingActivityId: z.string().optional(),
  balanceChange: z.number().optional(),
  lenderShare: z.number().optional(),
  description: z.string(),
  effectiveDate: z.date(),
  processedBy: z.string()
})

export type TransactionHistoryInput = z.infer<typeof transactionHistorySchema> 