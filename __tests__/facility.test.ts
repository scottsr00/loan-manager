import { prisma } from '@/server/db/client'
import { createFacility } from '@/server/actions/loan/createFacility'
import { type FacilityInput } from '@/server/types/facility'

describe('Facility Management', () => {
  let testCreditAgreement: any
  let testBorrower: any
  let testLender: any
  let testEntity: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock test entity
    testEntity = {
      id: 'test-entity-1',
      legalName: 'Test Corp',
      status: 'ACTIVE'
    }
    ;(prisma.entity.create as jest.Mock).mockResolvedValue(testEntity)

    // Mock test borrower
    testBorrower = {
      id: 'test-borrower-1',
      entityId: testEntity.id,
      onboardingStatus: 'COMPLETED',
      kycStatus: 'APPROVED'
    }
    ;(prisma.borrower.create as jest.Mock).mockResolvedValue(testBorrower)

    // Mock test lender
    testLender = {
      id: 'test-lender-1',
      entityId: testEntity.id,
      status: 'ACTIVE'
    }
    ;(prisma.lender.create as jest.Mock).mockResolvedValue(testLender)

    // Mock test credit agreement
    testCreditAgreement = {
      id: 'test-ca-1',
      agreementNumber: 'CA-TEST-001',
      borrowerId: testEntity.id,
      lenderId: testEntity.id,
      amount: 1000000,
      currency: 'USD',
      startDate: new Date(),
      maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
      interestRate: 5.0,
      status: 'ACTIVE',
      facilities: []
    }
    ;(prisma.creditAgreement.create as jest.Mock).mockResolvedValue(testCreditAgreement)
    ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue(testCreditAgreement)
  })

  describe('Facility Creation', () => {
    it('should create a facility within credit agreement limits', async () => {
      const facilityData: FacilityInput = {
        facilityName: 'Test Facility',
        facilityType: 'TERM_LOAN',
        creditAgreementId: testCreditAgreement.id,
        commitmentAmount: 500000,
        availableAmount: 500000,
        currency: 'USD',
        startDate: new Date(),
        maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 4)),
        interestType: 'FLOATING',
        baseRate: 'SOFR',
        margin: 2.5,
        status: 'ACTIVE'
      }

      const mockCreatedFacility = {
        id: 'test-facility-1',
        ...facilityData
      }
      ;(prisma.facility.create as jest.Mock).mockResolvedValue(mockCreatedFacility)

      const facility = await createFacility(facilityData)
      expect(facility).toBeDefined()
      expect(facility.commitmentAmount).toBeLessThanOrEqual(testCreditAgreement.amount)
      expect(facility.currency).toBe(testCreditAgreement.currency)
      expect(facility.maturityDate).toBeLessThanOrEqual(testCreditAgreement.maturityDate)
      expect(prisma.facility.create).toHaveBeenCalledWith({ data: facilityData })
    })

    it('should reject facility with commitment amount exceeding credit agreement', async () => {
      const facilityData: FacilityInput = {
        facilityName: 'Test Facility',
        facilityType: 'TERM_LOAN',
        creditAgreementId: testCreditAgreement.id,
        commitmentAmount: 1500000, // Exceeds credit agreement amount
        availableAmount: 1500000,
        currency: 'USD',
        startDate: new Date(),
        maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 4)),
        interestType: 'FLOATING',
        baseRate: 'SOFR',
        margin: 2.5,
        status: 'ACTIVE'
      }

      await expect(createFacility(facilityData)).rejects.toThrow('Total facility commitments would exceed credit agreement')
      expect(prisma.facility.create).not.toHaveBeenCalled()
    })

    it('should reject facility with different currency than credit agreement', async () => {
      const facilityData: FacilityInput = {
        facilityName: 'Test Facility',
        facilityType: 'TERM_LOAN',
        creditAgreementId: testCreditAgreement.id,
        commitmentAmount: 500000,
        availableAmount: 500000,
        currency: 'EUR', // Different currency
        startDate: new Date(),
        maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 4)),
        interestType: 'FLOATING',
        baseRate: 'SOFR',
        margin: 2.5,
        status: 'ACTIVE'
      }

      await expect(createFacility(facilityData)).rejects.toThrow('Facility currency must match credit agreement')
      expect(prisma.facility.create).not.toHaveBeenCalled()
    })

    it('should reject facility with maturity date beyond credit agreement', async () => {
      const facilityData: FacilityInput = {
        facilityName: 'Test Facility',
        facilityType: 'TERM_LOAN',
        creditAgreementId: testCreditAgreement.id,
        commitmentAmount: 500000,
        availableAmount: 500000,
        currency: 'USD',
        startDate: new Date(),
        maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 6)), // Beyond credit agreement
        interestType: 'FLOATING',
        baseRate: 'SOFR',
        margin: 2.5,
        status: 'ACTIVE'
      }

      await expect(createFacility(facilityData)).rejects.toThrow('Facility maturity date cannot exceed credit agreement')
      expect(prisma.facility.create).not.toHaveBeenCalled()
    })

    it('should validate total facilities do not exceed credit agreement amount', async () => {
      // Mock credit agreement with existing facility
      const existingFacility = {
        id: 'test-facility-1',
        commitmentAmount: 600000
      }
      testCreditAgreement.facilities = [existingFacility]
      ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue(testCreditAgreement)

      // Try to create second facility that would exceed total
      const facility2Data: FacilityInput = {
        facilityName: 'Test Facility 2',
        facilityType: 'TERM_LOAN',
        creditAgreementId: testCreditAgreement.id,
        commitmentAmount: 500000,
        availableAmount: 500000,
        currency: 'USD',
        startDate: new Date(),
        maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 4)),
        interestType: 'FLOATING',
        baseRate: 'SOFR',
        margin: 2.5,
        status: 'ACTIVE'
      }

      await expect(createFacility(facility2Data)).rejects.toThrow('Total facility commitments would exceed credit agreement')
      expect(prisma.facility.create).not.toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      const invalidData = {
        facilityType: 'TERM_LOAN',
        creditAgreementId: testCreditAgreement.id,
        commitmentAmount: 500000,
        // Missing required fields
      }

      // @ts-ignore - Testing invalid data
      await expect(createFacility(invalidData)).rejects.toThrow()
      expect(prisma.facility.create).not.toHaveBeenCalled()
    })

    it('should validate facility types', async () => {
      const facilityData: FacilityInput = {
        facilityName: 'Test Facility',
        facilityType: 'INVALID_TYPE', // Invalid type
        creditAgreementId: testCreditAgreement.id,
        commitmentAmount: 500000,
        availableAmount: 500000,
        currency: 'USD',
        startDate: new Date(),
        maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 4)),
        interestType: 'FLOATING',
        baseRate: 'SOFR',
        margin: 2.5,
        status: 'ACTIVE'
      }

      // @ts-ignore - Testing invalid type
      await expect(createFacility(facilityData)).rejects.toThrow('Invalid facility type')
      expect(prisma.facility.create).not.toHaveBeenCalled()
    })
  })
}) 