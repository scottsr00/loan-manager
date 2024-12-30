import { z } from 'zod'

const KYC_STATUSES = ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED'] as const
const ONBOARDING_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] as const

export const createBorrowerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  taxId: z.string().optional(),
  countryOfIncorporation: z.string().optional(),
  industrySegment: z.string().min(1, 'Industry segment is required'),
  businessType: z.string().min(1, 'Business type is required'),
  creditRating: z.string().optional(),
  ratingAgency: z.string().optional(),
  riskRating: z.string().optional(),
  onboardingStatus: z.enum(ONBOARDING_STATUSES).default('PENDING'),
  kycStatus: z.enum(KYC_STATUSES).default('PENDING')
})

export type CreateBorrowerInput = z.infer<typeof createBorrowerSchema>

export interface Borrower {
  id: string
  name: string
  taxId: string | null
  countryOfIncorporation: string | null
  industrySegment: string | null
  businessType: string | null
  creditRating: string | null
  ratingAgency: string | null
  riskRating: string | null
  onboardingStatus: string
  kycStatus: string
  createdAt: Date
  updatedAt: Date
} 