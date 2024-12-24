export interface Borrower {
  id: string
  entityId: string
  entity: {
    id: string
    legalName: string
    dba?: string
    registrationNumber?: string
    taxId?: string
    dateOfBirth?: Date
    dateOfIncorporation?: Date
    countryOfIncorporation?: string
    governmentId?: string
    governmentIdType?: string
    governmentIdExpiry?: Date
    primaryContactName?: string
    primaryContactEmail?: string
    primaryContactPhone?: string
    status: string
    addresses: {
      type: string
      street1: string
      street2?: string
      city: string
      state?: string
      postalCode?: string
      country: string
      isPrimary: boolean
    }[]
    contacts: {
      type: string
      firstName: string
      lastName: string
      title?: string
      email?: string
      phone?: string
      isPrimary: boolean
    }[]
    beneficialOwners: {
      name: string
      dateOfBirth?: Date
      nationality?: string
      ownershipPercentage: number
      controlType: string
      verificationStatus: string
    }[]
  }
  industrySegment?: string
  businessType?: string
  creditRating?: string
  ratingAgency?: string
  riskRating?: string
  onboardingStatus: string
  kycStatus: string
  createdAt: Date
} 