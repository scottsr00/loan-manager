import { z } from 'zod'
import type { Entity } from './entity'

export const createBorrowerSchema = z.object({
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
  onboardingStatus: z.string().default('PENDING'),
  kycStatus: z.string().default('PENDING')
})

export type CreateBorrowerInput = z.infer<typeof createBorrowerSchema>

export interface Borrower {
  id: string
  entityId: string
  entity: {
    id: string
    legalName: string
    dba: string | null
    registrationNumber: string | null
    taxId: string | null
    dateOfBirth: Date | null
    dateOfIncorporation: Date | null
    countryOfIncorporation: string | null
    governmentId: string | null
    governmentIdType: string | null
    governmentIdExpiry: Date | null
    primaryContactName: string | null
    primaryContactEmail: string | null
    primaryContactPhone: string | null
    status: string
    addresses: {
      id: string
      entityId: string
      type: string
      street1: string
      street2: string | null
      city: string
      state: string | null
      postalCode: string | null
      country: string
      isPrimary: boolean
      createdAt: Date
      updatedAt: Date
    }[]
    contacts: {
      id: string
      entityId: string
      type: string
      firstName: string
      lastName: string
      title: string | null
      email: string | null
      phone: string | null
      isPrimary: boolean
      createdAt: Date
      updatedAt: Date
    }[]
    beneficialOwners: {
      id: string
      entityId: string
      name: string
      dateOfBirth: Date | null
      nationality: string | null
      ownershipPercentage: number
      controlType: string
      verificationStatus: string
      createdAt: Date
      updatedAt: Date
    }[]
    createdAt: Date
    updatedAt: Date
  }
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