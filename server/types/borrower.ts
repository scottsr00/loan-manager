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

// Base schema with common fields
const borrowerBaseSchema = {
  industrySegment: z.string().min(1, 'Industry segment is required'),
  businessType: z.string().min(1, 'Business type is required'),
  creditRating: z.string().optional(),
  ratingAgency: z.string().optional(),
  riskRating: z.string().optional(),
  onboardingStatus: onboardingStatusEnum,
  kycStatus: kycStatusEnum
}

// Input Validation Schema for creating new borrowers
export const borrowerInputSchema = z.object({
  ...borrowerBaseSchema,
  entityId: z.string().min(1, 'Entity ID is required'),
})

// Input Validation Schema for updating existing borrowers
export const borrowerUpdateSchema = z.object({
  ...borrowerBaseSchema,
  entityId: z.string().min(1, 'Entity ID is required').optional(),
})

export type BorrowerInput = z.infer<typeof borrowerInputSchema>
export type BorrowerUpdateInput = z.infer<typeof borrowerUpdateSchema> 