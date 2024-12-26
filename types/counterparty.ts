export type CounterpartyType = {
  id: string
  name: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

export type CounterpartyAddress = {
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
}

export type CounterpartyContact = {
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
}

export type Counterparty = {
  id: string
  legalName: string
  dba?: string | null
  registrationNumber?: string | null
  taxId?: string | null
  typeId: string
  type: CounterpartyType
  status: string
  incorporationDate?: Date | null
  website?: string | null
  description?: string | null
  addresses: CounterpartyAddress[]
  contacts: CounterpartyContact[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateCounterpartyInput {
  legalName: string
  typeId: string
  status?: string
}

export interface UpdateCounterpartyInput extends Partial<CreateCounterpartyInput> {
  id: string
} 