import type { Address } from './address'
import type { Contact } from './contact'
import type { BeneficialOwner } from './beneficialOwner'

export interface Entity {
  id: string
  legalName: string
  dba?: string
  registrationNumber?: string
  taxId?: string
  jurisdiction?: string
  dateOfBirth?: Date
  dateOfIncorporation?: Date
  status: string
  createdAt: Date
  updatedAt: Date
  addresses: Address[]
  contacts: Contact[]
  beneficialOwners: BeneficialOwner[]
}

export interface CreateEntityInput {
  legalName: string
  dba?: string
  registrationNumber?: string
  taxId?: string
  jurisdiction?: string
  dateOfBirth?: Date
  dateOfIncorporation?: Date
  status?: string
} 