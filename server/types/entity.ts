import { type Prisma } from '@prisma/client'
import { z } from 'zod'

// Base Prisma Types with Relations
export interface EntityWithRelations {
  id: string
  legalName: string
  dba?: string | null
  status: string
  jurisdiction?: string | null
  createdAt: Date
  updatedAt: Date
  addresses: Array<{
    id: string
    type: string
    street1: string
    street2: string | null
    city: string
    state: string | null
    postalCode: string | null
    country: string
    isPrimary: boolean
  }>
  contacts: Array<{
    id: string
    firstName: string
    lastName: string
    title: string | null
    email: string | null
    phone: string | null
    isPrimary: boolean
  }>
  kyc?: {
    verificationStatus: string
    counterpartyVerified: boolean
    lastVerificationDate: Date | null
  }
  isLender: boolean
  isBorrower: boolean
  isCounterparty: boolean
  isAgent: boolean
}

// Input Validation Schemas
export const entityAddressSchema = z.object({
  type: z.string().min(1, 'Address type is required'),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  isPrimary: z.boolean().default(true),
})

export const entityContactSchema = z.object({
  type: z.string().min(1, 'Contact type is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  isPrimary: z.boolean().default(true),
})

export const entityInputSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  dba: z.string().optional(),
  taxId: z.string().optional(),
  countryOfIncorporation: z.string().optional(),
  status: z.string().default('ACTIVE'),
  addresses: z.array(entityAddressSchema).min(1, 'At least one address is required'),
  contacts: z.array(entityContactSchema).min(1, 'At least one contact is required'),
})

// Inferred Types from Schemas
export type EntityAddress = z.infer<typeof entityAddressSchema>
export type EntityContact = z.infer<typeof entityContactSchema>
export type EntityInput = z.infer<typeof entityInputSchema> 