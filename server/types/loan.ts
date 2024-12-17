import { type Prisma, type Loan as PrismaLoan } from '@prisma/client'
import { z } from 'zod'

// Base Prisma Types with Relations
export type LoanWithRelations = Prisma.LoanGetPayload<{
  include: {
    trades: true
    lenderPositions: {
      include: {
        lender: true
      }
    }
  }
}>

// Input Validation Schemas
export const lenderPositionSchema = z.object({
  lenderId: z.string().min(1, 'Lender ID is required'),
  balance: z.number().positive('Balance must be positive'),
})

export const loanInputSchema = z.object({
  dealName: z.string().min(1, 'Deal name is required'),
  currentBalance: z.number().positive('Current balance must be positive'),
  currentPeriodTerms: z.string().min(1, 'Current period terms are required'),
  priorPeriodPaymentStatus: z.string().min(1, 'Prior period payment status is required'),
  agentBank: z.string().min(1, 'Agent bank is required'),
  lenderPositions: z.array(lenderPositionSchema).min(1, 'At least one lender position is required'),
})

// Servicing Activity Types
export const servicingActivitySchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
  activityType: z.enum(['Payment', 'Documentation', 'Compliance', 'Credit Review', 'Amendment', 'Other']),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.date(),
  assignedTo: z.string().min(1, 'Assignee is required'),
})

export const servicingActivityParamsSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  status: z.string().optional(),
  activityType: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  assignedTo: z.string().optional(),
})

// Inferred Types from Schemas
export type LenderPosition = z.infer<typeof lenderPositionSchema>
export type LoanInput = z.infer<typeof loanInputSchema>
export type ServicingActivityInput = z.infer<typeof servicingActivitySchema>
export type ServicingActivityParams = z.infer<typeof servicingActivityParamsSchema> 