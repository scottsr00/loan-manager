import { type Prisma, type CreditAgreement as PrismaCreditAgreement } from '@prisma/client'
import { z } from 'zod'

// Base Prisma Types with Relations
export type CreditAgreementWithRelations = Prisma.CreditAgreementGetPayload<{
  include: {
    borrower: true
    lender: true
    facilities: true
    trades: {
      include: {
        counterparty: true
      }
    }
  }
}>

// Input Validation Schemas
export const facilityInputSchema = z.object({
  facilityName: z.string().min(1, 'Facility name is required'),
  facilityType: z.string().min(1, 'Facility type is required'),
  commitmentAmount: z.number().positive('Commitment amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  startDate: z.date(),
  maturityDate: z.date(),
  interestType: z.string().min(1, 'Interest type is required'),
  baseRate: z.string().min(1, 'Base rate is required'),
  margin: z.number(),
  description: z.string().optional(),
})

export const creditAgreementInputSchema = z.object({
  agreementName: z.string().min(1, 'Agreement name is required'),
  agreementNumber: z.string().min(1, 'Agreement number is required'),
  borrowerId: z.string().min(1, 'Borrower ID is required'),
  lenderId: z.string().min(1, 'Lender ID is required'),
  status: z.string().min(1, 'Status is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  startDate: z.date(),
  maturityDate: z.date(),
  interestRate: z.number().min(0, 'Interest rate must be non-negative'),
  description: z.string().optional(),
  facilities: z.array(facilityInputSchema).min(1, 'At least one facility is required'),
})

// Inferred Types from Schemas
export type FacilityInput = z.infer<typeof facilityInputSchema>
export type CreditAgreementInput = z.infer<typeof creditAgreementInputSchema> 