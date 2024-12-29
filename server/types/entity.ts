import { type Prisma } from '@prisma/client'
import { z } from 'zod'

// Base Prisma Types with Relations
export type EntityWithRelations = Prisma.EntityGetPayload<{
  include: {
    addresses: true
    contacts: true
    beneficialOwners: true
    lender: true
    borrower: true
  }
}>

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
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  dateOfBirth: z.date().optional(),
  dateOfIncorporation: z.date().optional(),
  countryOfIncorporation: z.string().optional(),
  governmentId: z.string().optional(),
  governmentIdType: z.string().optional(),
  governmentIdExpiry: z.date().optional(),
  primaryContactName: z.string().optional(),
  primaryContactEmail: z.string().optional(),
  primaryContactPhone: z.string().optional(),
  status: z.string().default('ACTIVE'),
  isAgent: z.boolean().default(false),
  addresses: z.array(entityAddressSchema).min(1, 'At least one address is required'),
  contacts: z.array(entityContactSchema).min(1, 'At least one contact is required'),
})

// Inferred Types from Schemas
export type EntityAddress = z.infer<typeof entityAddressSchema>
export type EntityContact = z.infer<typeof entityContactSchema>
export type EntityInput = z.infer<typeof entityInputSchema> 