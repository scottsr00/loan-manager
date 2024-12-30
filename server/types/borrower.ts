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

// Input Validation Schema
export const borrowerInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
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

export type BorrowerInput = z.infer<typeof borrowerInputSchema> 