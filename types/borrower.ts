import { z } from 'zod'

export const createBorrowerSchema = z.object({
  entityId: z.string().min(1, 'Entity is required'),
  industrySegment: z.string().min(1, 'Industry segment is required'),
  businessType: z.string().default('CORPORATE'),
  riskRating: z.string().optional(),
  creditRating: z.string().optional(),
  ratingAgency: z.string().optional(),
})

export type CreateBorrowerInput = z.infer<typeof createBorrowerSchema>

export interface Borrower {
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
  businessType: string
  status: string
  riskRating: string | null
  amlStatus: string
  sanctionsStatus: string
} 