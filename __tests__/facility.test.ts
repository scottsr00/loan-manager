import { type Facility } from '@prisma/client'
import { prisma } from '@/server/db/client'
import { createFacility } from '@/server/actions/loan/createFacility'
import { type FacilityInput } from '@/server/types/facility'

// Mock data types
interface TestEntity {
  id: string
  legalName: string
  status: string
  createdAt: Date
  updatedAt: Date
  dba: string | null
  registrationNumber: string | null
  taxId: string | null
  dateOfBirth: Date | null
  countryOfIncorporation: string | null
  stateOfIncorporation: string | null
  primaryContactName: string | null
  primaryContactEmail: string | null
  primaryContactPhone: string | null
  dateOfIncorporation: Date | null
  governmentId: string | null
  governmentIdType: string | null
  governmentIdExpiry: Date | null
}

interface TestCreditAgreement {
  id: string
  amount: number
  currency: string
  startDate: Date
  maturityDate: Date
  description: string | null
  createdAt: Date
  updatedAt: Date
  status: string
  agreementNumber: string
  borrowerId: string
  lenderId: string
  interestRate: number
  facilities: Facility[]
}

interface TestBorrower {
  id: string
  entityId: string
  status: string
  createdAt: Date
  updatedAt: Date
  industrySegment: string | null
  businessType: string | null
  creditRating: string | null
  ratingAgency: string | null
  riskRating: string | null
  onboardingStatus: string
  kycStatus: string
}

interface TestLender {
  id: string
  entityId: string
  status: string
  createdAt: Date
  updatedAt: Date
  onboardingDate: Date
}

type TestFacility = Omit<FacilityInput, 'description'> & {
  id: string
  createdAt: Date
  updatedAt: Date
  description: string | null
}

const now = new Date()

// Test data
const mockEntity: TestEntity = {
  id: 'test-entity-1',
  legalName: 'Test Corp',
  status: 'ACTIVE',
  createdAt: now,
  updatedAt: now,
  dba: null,
  registrationNumber: null,
  taxId: null,
  dateOfBirth: null,
  countryOfIncorporation: null,
  stateOfIncorporation: null,
  primaryContactName: null,
  primaryContactEmail: null,
  primaryContactPhone: null,
  dateOfIncorporation: null,
  governmentId: null,
  governmentIdType: null,
  governmentIdExpiry: null
}

const mockBorrower: TestBorrower = {
  id: 'test-borrower-1',
  entityId: mockEntity.id,
  status: 'ACTIVE',
  createdAt: now,
  updatedAt: now,
  industrySegment: null,
  businessType: null,
  creditRating: null,
  ratingAgency: null,
  riskRating: null,
  onboardingStatus: 'COMPLETED',
  kycStatus: 'APPROVED'
}

const mockLender: TestLender = {
  id: 'test-lender-1',
  entityId: 'test-entity-2',
  status: 'ACTIVE',
  createdAt: now,
  updatedAt: now,
  onboardingDate: now
}

const mockCreditAgreement: TestCreditAgreement = {
  id: 'test-ca-1',
  amount: 1000000,
  currency: 'USD',
  startDate: now,
  maturityDate: new Date(now.getFullYear() + 5, now.getMonth(), now.getDate()),
  description: null,
  createdAt: now,
  updatedAt: now,
  status: 'ACTIVE',
  agreementNumber: 'CA-TEST-001',
  borrowerId: mockBorrower.id,
  lenderId: mockLender.id,
  interestRate: 5.0,
  facilities: []
}

const mockFacilityInput: FacilityInput = {
  facilityName: 'Test Facility',
  facilityType: 'TERM_LOAN',
  creditAgreementId: mockCreditAgreement.id,
  commitmentAmount: 500000,
  availableAmount: 500000,
  currency: 'USD',
  startDate: now,
  maturityDate: new Date(now.getFullYear() + 4, now.getMonth(), now.getDate()),
  interestType: 'FLOATING',
  baseRate: 'SOFR',
  margin: 2.5,
  status: 'ACTIVE'
}

describe('Facility Management', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock findUnique responses
    jest.spyOn(prisma.entity, 'findUnique').mockResolvedValue(mockEntity)
    jest.spyOn(prisma.borrower, 'findUnique').mockResolvedValue(mockBorrower)
    jest.spyOn(prisma.lender, 'findUnique').mockResolvedValue(mockLender)
    jest.spyOn(prisma.creditAgreement, 'findUnique').mockResolvedValue(mockCreditAgreement)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createFacility', () => {
    it('should create a facility within credit agreement limits', async () => {
      // Mock successful facility creation
      const mockCreatedFacility: TestFacility = {
        ...mockFacilityInput,
        id: 'test-facility-1',
        createdAt: now,
        updatedAt: now,
        description: null
      }
      jest.spyOn(prisma.facility, 'create').mockResolvedValue(mockCreatedFacility)

      const result = await createFacility(mockFacilityInput)

      expect(result).toBeDefined()
      expect(result.facilityName).toBe(mockFacilityInput.facilityName)
      expect(result.commitmentAmount).toBe(mockFacilityInput.commitmentAmount)
      expect(result.maturityDate.getTime()).toBeLessThanOrEqual(mockCreditAgreement.maturityDate.getTime())
    })

    it('should reject if facility amount exceeds credit agreement amount', async () => {
      const invalidFacility = {
        ...mockFacilityInput,
        commitmentAmount: mockCreditAgreement.amount + 1
      }

      await expect(createFacility(invalidFacility)).rejects.toThrow(
        'Facility commitment amount cannot exceed credit agreement amount'
      )
    })

    it('should reject if facility currency does not match credit agreement', async () => {
      const invalidFacility = {
        ...mockFacilityInput,
        currency: 'EUR'
      }

      await expect(createFacility(invalidFacility)).rejects.toThrow(
        'Facility currency must match credit agreement currency'
      )
    })

    it('should reject if facility maturity date exceeds credit agreement', async () => {
      const invalidFacility = {
        ...mockFacilityInput,
        maturityDate: new Date(mockCreditAgreement.maturityDate.getTime() + 86400000) // Add one day
      }

      await expect(createFacility(invalidFacility)).rejects.toThrow(
        'Facility maturity date cannot exceed credit agreement maturity date'
      )
    })

    it('should validate required fields', async () => {
      const invalidFacility = { ...mockFacilityInput } as Partial<FacilityInput>
      delete invalidFacility.facilityName

      await expect(createFacility(invalidFacility as FacilityInput)).rejects.toThrow()
    })

    it('should validate facility type', async () => {
      const invalidFacility = {
        ...mockFacilityInput,
        facilityType: 'INVALID_TYPE'
      }

      await expect(createFacility(invalidFacility as unknown as FacilityInput)).rejects.toThrow()
    })
  })
}) 