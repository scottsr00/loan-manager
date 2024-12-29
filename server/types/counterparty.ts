import { type Prisma, type Counterparty as PrismaCounterparty } from '@prisma/client'
import { z } from 'zod'

// Base Prisma Types with Relations
export type CounterpartyWithRelations = Prisma.CounterpartyGetPayload<{
  include: {
    type: true
    addresses: true
    contacts: true
  }
}>

// Input Validation Schemas
export const addressSchema = z.object({
  type: z.string().min(1, 'Address type is required'),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  isPrimary: z.boolean()
})

export const contactSchema = z.object({
  type: z.string().min(1, 'Contact type is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isPrimary: z.boolean()
})

export const counterpartyInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  typeId: z.string().min(1, 'Counterparty type is required'),
  status: z.string().default('ACTIVE'),
  addresses: z.array(addressSchema).min(1, 'At least one address is required'),
  contacts: z.array(contactSchema).min(1, 'At least one contact is required')
})

// Inferred Types from Schemas
export type CounterpartyInput = z.infer<typeof counterpartyInputSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ContactInput = z.infer<typeof contactSchema>

// Full Counterparty Type matching Prisma schema
export interface Counterparty extends PrismaCounterparty {
  id: string
  name: string
  typeId: string
  type: {
    id: string
    name: string
    description?: string | null
  }
  status: string
  addresses: Array<{
    id: string
    counterpartyId: string
    type: string
    street1: string
    street2?: string | null
    city: string
    state?: string | null
    postalCode?: string | null
    country: string
    isPrimary: boolean
    createdAt: Date
    updatedAt: Date
  }>
  contacts: Array<{
    id: string
    counterpartyId: string
    type: string
    firstName: string
    lastName: string
    title?: string | null
    email?: string | null
    phone?: string | null
    isPrimary: boolean
    createdAt: Date
    updatedAt: Date
  }>
  createdAt: Date
  updatedAt: Date
} 