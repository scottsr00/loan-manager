import { type Prisma, type Borrower as PrismaBorrower } from '@prisma/client'
import { z } from 'zod'

// Base Prisma Types with Relations
export type BorrowerWithRelations = Prisma.BorrowerGetPayload<{
  include: {
    entity: {
      include: {
        entityType: true
        addresses: true
        contacts: true
      }
    }
    requiredDocuments: true
    financialStatements: true
    covenants: true
  }
}>

// Input Validation Schemas
export const borrowerInputSchema = z.object({
  entityId: z.string().min(1, 'Entity ID is required'),
  industrySegment: z.string().min(1, 'Industry segment is required'),
  creditRating: z.string().optional(),
  ratingAgency: z.string().optional(),
  onboardingStatus: z.string().min(1, 'Onboarding status is required'),
  kycStatus: z.string().min(1, 'KYC status is required'),
})

export const financialStatementSchema = z.object({
  borrowerId: z.string().min(1, 'Borrower ID is required'),
  statementType: z.string().min(1, 'Statement type is required'),
  statementDate: z.date(),
  revenue: z.number(),
  ebitda: z.number(),
  totalAssets: z.number(),
  totalLiabilities: z.number(),
  netIncome: z.number(),
})

export const borrowerCovenantSchema = z.object({
  borrowerId: z.string().min(1, 'Borrower ID is required'),
  covenantType: z.string().min(1, 'Covenant type is required'),
  description: z.string().min(1, 'Description is required'),
  threshold: z.number(),
  frequency: z.string().min(1, 'Frequency is required'),
  startDate: z.date(),
  endDate: z.date().optional(),
})

// Inferred Types from Schemas
export type BorrowerInput = z.infer<typeof borrowerInputSchema>
export type FinancialStatement = z.infer<typeof financialStatementSchema>
export type BorrowerCovenant = z.infer<typeof borrowerCovenantSchema>

// Response Types
export interface BorrowerSummary {
  id: string
  name: string
  taxId: string
  jurisdiction: string
  industry: string
  creditRating: string
  ratingAgency: string
  onboardingStatus: string
  kycStatus: string
  entityId: string
  createdAt: Date
} 