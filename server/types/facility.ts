import { z } from 'zod'

export const facilityTypeEnum = z.enum([
  'TERM_LOAN',
  'REVOLVING',
  'DELAYED_DRAW',
  'LETTER_OF_CREDIT',
  'BRIDGE_LOAN'
])

export const interestTypeEnum = z.enum([
  'FIXED',
  'FLOATING'
])

export const baseRateEnum = z.enum([
  'SOFR',
  'EURIBOR',
  'PRIME',
  'FIXED'
])

export const facilityInputSchema = z.object({
  facilityName: z.string().min(1, 'Facility name is required'),
  facilityType: facilityTypeEnum,
  creditAgreementId: z.string().min(1, 'Credit agreement ID is required'),
  commitmentAmount: z.number().positive('Commitment amount must be positive'),
  availableAmount: z.number().positive('Available amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  startDate: z.date(),
  maturityDate: z.date(),
  interestType: interestTypeEnum,
  baseRate: baseRateEnum,
  margin: z.number().min(0, 'Margin must be non-negative'),
  description: z.string().optional(),
  status: z.string().default('ACTIVE')
})

export type FacilityInput = z.infer<typeof facilityInputSchema> 