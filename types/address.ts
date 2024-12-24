export interface Address {
  id: string
  entityId: string
  addressType: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateAddressInput {
  addressType: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  isPrimary?: boolean
} 