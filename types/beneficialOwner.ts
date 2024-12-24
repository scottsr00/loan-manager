export interface BeneficialOwner {
  id: string
  entityId: string
  firstName: string
  lastName: string
  dateOfBirth?: Date
  nationality?: string
  ownershipPercentage: number
  isPep: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateBeneficialOwnerInput {
  firstName: string
  lastName: string
  dateOfBirth?: Date
  nationality?: string
  ownershipPercentage: number
  isPep?: boolean
} 