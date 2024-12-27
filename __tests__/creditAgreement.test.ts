import { prisma } from '@/server/db/client'
import { updateCreditAgreement } from '@/server/actions/loan/updateCreditAgreement'
import { type UpdateCreditAgreementInput } from '@/server/types/credit-agreement'

describe('Credit Agreement Management', () => {
  let testCreditAgreement: any
  let testBorrower: any
  let testLender: any
  let testEntity: any
  let testFacility: any

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

    // Mock test facility
    testFacility = {
      id: 'test-facility-1',
      facilityName: 'Test Facility',
      facilityType: 'TERM_LOAN',
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
      facilities: [testFacility],
      borrower: {
        entity: testEntity
      },
      lender: {
        entity: testEntity
      }
    }
    ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue(testCreditAgreement)
  })

  describe('Credit Agreement Updates', () => {
    it('should update credit agreement details while preserving facility relationships', async () => {
      const updateData: UpdateCreditAgreementInput = {
        id: testCreditAgreement.id,
        agreementNumber: 'CA-TEST-001-UPDATED',
        amount: 1500000, // Increased amount
        currency: 'USD',
        startDate: testCreditAgreement.startDate,
        maturityDate: testCreditAgreement.maturityDate,
        interestRate: 6.0, // Updated rate
        status: 'ACTIVE',
        borrowerId: testCreditAgreement.borrowerId,
        description: 'Updated agreement'
      }

      const mockUpdatedAgreement = {
        ...testCreditAgreement,
        ...updateData,
        facilities: testCreditAgreement.facilities
      }
      ;(prisma.creditAgreement.update as jest.Mock).mockResolvedValue(mockUpdatedAgreement)

      const result = await updateCreditAgreement(updateData)
      expect(result).toBeDefined()
      expect(result.agreementNumber).toBe(updateData.agreementNumber)
      expect(result.amount).toBe(updateData.amount)
      expect(result.interestRate).toBe(updateData.interestRate)
      expect(result.facilities).toHaveLength(1)
      expect(result.facilities[0].id).toBe(testFacility.id)
      expect(prisma.creditAgreement.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: updateData.id },
          data: expect.objectContaining(updateData)
        })
      )
    })

    it('should reject updates that would make facility commitments exceed new credit agreement amount', async () => {
      const updateData: UpdateCreditAgreementInput = {
        id: testCreditAgreement.id,
        agreementNumber: 'CA-TEST-001',
        amount: 400000, // Amount less than existing facility commitment
        currency: 'USD',
        startDate: testCreditAgreement.startDate,
        maturityDate: testCreditAgreement.maturityDate,
        interestRate: 5.0,
        status: 'ACTIVE',
        borrowerId: testCreditAgreement.borrowerId
      }

      ;(prisma.creditAgreement.update as jest.Mock).mockRejectedValue(
        new Error('Credit agreement amount cannot be less than total facility commitments')
      )

      await expect(updateCreditAgreement(updateData)).rejects.toThrow(
        'Credit agreement amount cannot be less than total facility commitments'
      )
      expect(prisma.creditAgreement.update).toHaveBeenCalled()
    })

    it('should reject updates that would make facility maturity dates invalid', async () => {
      const updateData: UpdateCreditAgreementInput = {
        id: testCreditAgreement.id,
        agreementNumber: 'CA-TEST-001',
        amount: 1000000,
        currency: 'USD',
        startDate: testCreditAgreement.startDate,
        maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)), // Earlier than facility maturity
        interestRate: 5.0,
        status: 'ACTIVE',
        borrowerId: testCreditAgreement.borrowerId
      }

      ;(prisma.creditAgreement.update as jest.Mock).mockRejectedValue(
        new Error('Credit agreement maturity date cannot be earlier than facility maturity dates')
      )

      await expect(updateCreditAgreement(updateData)).rejects.toThrow(
        'Credit agreement maturity date cannot be earlier than facility maturity dates'
      )
      expect(prisma.creditAgreement.update).toHaveBeenCalled()
    })

    it('should reject currency changes when facilities exist', async () => {
      const updateData: UpdateCreditAgreementInput = {
        id: testCreditAgreement.id,
        agreementNumber: 'CA-TEST-001',
        amount: 1000000,
        currency: 'EUR', // Different currency
        startDate: testCreditAgreement.startDate,
        maturityDate: testCreditAgreement.maturityDate,
        interestRate: 5.0,
        status: 'ACTIVE',
        borrowerId: testCreditAgreement.borrowerId
      }

      ;(prisma.creditAgreement.update as jest.Mock).mockRejectedValue(
        new Error('Cannot change currency of credit agreement with existing facilities')
      )

      await expect(updateCreditAgreement(updateData)).rejects.toThrow(
        'Cannot change currency of credit agreement with existing facilities'
      )
      expect(prisma.creditAgreement.update).toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      const invalidData = {
        id: testCreditAgreement.id,
        // Missing required fields
      }

      // @ts-ignore - Testing invalid data
      await expect(updateCreditAgreement(invalidData)).rejects.toThrow()
      expect(prisma.creditAgreement.update).not.toHaveBeenCalled()
    })
  })
}) 