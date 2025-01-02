import { z } from 'zod'

export interface Address {
  id: string
  entityId?: string | null
  counterpartyId?: string | null
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
}

export const addressSchema = z.object({
  type: z.string().min(1, 'Address type is required'),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  isPrimary: z.boolean().default(false),
})

export type CreateAddressInput = z.infer<typeof addressSchema>

export const ADDRESS_TYPES = {
  REGISTERED: 'REGISTERED',
  MAILING: 'MAILING',
  BILLING: 'BILLING',
  PHYSICAL: 'PHYSICAL',
} as const

export type AddressType = keyof typeof ADDRESS_TYPES 