export interface Counterparty {
  id: string
  legalName: string
  parentName?: string
  ultParentName?: string
  counterpartyType: {
    id: string
    name: string
  }
  kycStatus: string
  onboardingStatus: string
  registrationNumber?: string
  taxId?: string
  website?: string
  description?: string
  addresses: Array<{
    id: string
    type: string
    street1: string
    street2?: string
    city: string
    state?: string
    postalCode?: string
    country: string
    isPrimary: boolean
  }>
  contacts: Array<{
    id: string
    type: string
    firstName: string
    lastName: string
    title?: string
    email?: string
    phone?: string
    isPrimary: boolean
  }>
  createdAt: Date
  updatedAt: Date
} 