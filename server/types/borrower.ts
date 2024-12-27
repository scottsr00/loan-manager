import { type Prisma } from '@prisma/client'
import { z } from 'zod'

// Enums
export const onboardingStatusEnum = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED'
])

export const kycStatusEnum = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'APPROVED',
  'REJECTED'
])

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
  legalName: z.string().min(1, 'Legal name is required'),
  dba: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  countryOfIncorporation: z.string().optional(),
  industrySegment: z.string().min(1, 'Industry segment is required'),
  businessType: z.string().min(1, 'Business type is required'),
  creditRating: z.string().optional(),
  ratingAgency: z.string().optional(),
  riskRating: z.string().optional(),
  onboardingStatus: onboardingStatusEnum,
  kycStatus: kycStatusEnum
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