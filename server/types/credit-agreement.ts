import { type CreditAgreement, type Entity, type Facility, type TransactionHistory } from '@prisma/client'
import { z } from 'zod'

// Base Prisma Types with Relations
export type CreditAgreementWithRelations = CreditAgreement & {
  borrower: Entity & {
    borrower: {
      id: string
      status: string
      createdAt: Date
      updatedAt: Date
      entityId: string
      onboardingDate: Date
    } | null
  }
  lender: Entity & {
    lender: {
      id: string
      status: string
      createdAt: Date
      updatedAt: Date
      entityId: string
      onboardingDate: Date
    } | null
  }
  facilities: (Facility & {
    trades: {
      id: string
      facilityId: string
      counterpartyId: string
      tradeDate: Date
      settlementDate: Date
      amount: number
      price: number
      status: string
      createdAt: Date
      updatedAt: Date
      counterparty: Entity
    }[]
  })[]
  transactions: TransactionHistory[]
}

// Input Validation Schemas
export const facilityInputSchema = z.object({
  facilityName: z.string().min(1, 'Facility name is required'),
  facilityType: z.string().min(1, 'Facility type is required'),
  commitmentAmount: z.number().positive('Commitment amount must be positive'),
  availableAmount: z.number().optional(),
  currency: z.string().min(1, 'Currency is required'),
  startDate: z.date(),
  maturityDate: z.date(),
  interestType: z.string().min(1, 'Interest type is required'),
  baseRate: z.string().min(1, 'Base rate is required'),
  margin: z.number(),
  description: z.string().optional(),
})

export const creditAgreementInputSchema = z.object({
  agreementNumber: z.string().min(1, 'Agreement number is required'),
  borrowerId: z.string().min(1, 'Borrower is required'),
  lenderId: z.string().min(1, 'Lender is required'),
  status: z.string(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string(),
  startDate: z.date(),
  maturityDate: z.date(),
  interestRate: z.number().min(0, 'Interest rate must be non-negative'),
  description: z.string().optional(),
  facilities: z.array(facilityInputSchema).default([])
})

export const updateCreditAgreementSchema = z.object({
  id: z.string(),
  agreementNumber: z.string().optional(),
  borrowerId: z.string().optional(),
  lenderId: z.string().optional(),
  status: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  startDate: z.date().optional(),
  maturityDate: z.date().optional(),
  interestRate: z.number().optional(),
  description: z.string().optional(),
})

export type UpdateCreditAgreementInput = z.infer<typeof updateCreditAgreementSchema>

// Inferred Types from Schemas
export type FacilityInput = z.infer<typeof facilityInputSchema>
export type CreditAgreementInput = z.infer<typeof creditAgreementInputSchema> 