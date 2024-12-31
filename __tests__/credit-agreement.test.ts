import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { createCreditAgreement } from '@/server/actions/loan/createCreditAgreement'
import { updateCreditAgreement } from '@/server/actions/loan/updateCreditAgreement'
import { type UpdateCreditAgreementInput } from '@/server/types/credit-agreement'
import { type PrismaClient } from '@prisma/client'

const mockPrisma = {
  $transaction: jest.fn((callback: any) => Promise.resolve(callback(mockPrisma))),
  creditAgreement: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  borrower: {
    findUnique: jest.fn(),
  },
  lender: {
    findUnique: jest.fn(),
  },
  facility: {
    findMany: jest.fn(),
  },
} as any

jest.mock('@/server/db/client', () => ({
  prisma: mockPrisma,
}))

describe('Credit Agreement Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCreditAgreement', () => {
    const mockBorrower = {
      id: 'borrower-1',
      name: 'Test Borrower Inc',
      onboardingStatus: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      taxId: null,
      countryOfIncorporation: null,
      industrySegment: null,
      businessType: null,
      kycStatus: 'APPROVED',
      creditRating: null,
      ratingAgency: null,
      riskRating: null,
    }

    const mockLender = {
      id: 'lender-1',
      legalName: 'Test Bank',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      entityId: 'entity-1',
      onboardingDate: new Date(),
    }

    const mockAgreement = {
      agreementNumber: 'CA-2024-001',
      borrowerId: 'borrower-1',
      lenderId: 'lender-1',
      status: 'PENDING',
      amount: 1000000,
      currency: 'USD',
      startDate: new Date('2024-01-01'),
      maturityDate: new Date('2025-01-01'),
      interestRate: 5.5,
      description: 'Test credit agreement',
      createdAt: new Date(),
      updatedAt: new Date(),
      facilities: [{
        facilityName: 'Term Loan A',
        facilityType: 'TERM_LOAN',
        commitmentAmount: 1000000,
        currency: 'USD',
        startDate: new Date('2024-01-01'),
        maturityDate: new Date('2025-01-01'),
        interestType: 'FLOATING',
        baseRate: 'SOFR',
        margin: 2.5,
        description: 'Test facility',
        createdAt: new Date(),
        updatedAt: new Date(),
      }]
    }

    it('should create a credit agreement with valid inputs', async () => {
      mockPrisma.borrower.findUnique.mockResolvedValueOnce(mockBorrower)
      mockPrisma.lender.findUnique.mockResolvedValueOnce(mockLender)
      
      const createdAgreement = {
        id: 'ca-1',
        ...mockAgreement,
        borrower: mockBorrower,
        lender: mockLender,
        facilities: [{
          id: 'facility-1',
          ...mockAgreement.facilities[0],
          availableAmount: mockAgreement.facilities[0].commitmentAmount,
        }],
      }
      
      mockPrisma.creditAgreement.create.mockResolvedValueOnce(createdAgreement)

      const result = await createCreditAgreement(mockAgreement)

      expect(result).toHaveProperty('id', 'ca-1')
      expect(result.borrowerId).toBe('borrower-1')
      expect(result.lenderId).toBe('lender-1')
      expect(mockPrisma.creditAgreement.create).toHaveBeenCalledTimes(1)
    })

    it('should throw error if borrower does not exist', async () => {
      mockPrisma.borrower.findUnique.mockResolvedValueOnce(null)
      mockPrisma.lender.findUnique.mockResolvedValueOnce(mockLender)

      await expect(createCreditAgreement(mockAgreement))
        .rejects.toThrow('Borrower not found')

      expect(mockPrisma.creditAgreement.create).not.toHaveBeenCalled()
    })

    it('should throw error if lender does not exist', async () => {
      mockPrisma.borrower.findUnique.mockResolvedValueOnce(mockBorrower)
      mockPrisma.lender.findUnique.mockResolvedValueOnce(null)

      await expect(createCreditAgreement(mockAgreement))
        .rejects.toThrow('Lender not found')

      expect(mockPrisma.creditAgreement.create).not.toHaveBeenCalled()
    })

    it('should validate maturity date is after start date', async () => {
      mockPrisma.borrower.findUnique.mockResolvedValueOnce(mockBorrower)
      mockPrisma.lender.findUnique.mockResolvedValueOnce(mockLender)
      const invalidAgreement = {
        ...mockAgreement,
        startDate: new Date('2025-01-01'),
        maturityDate: new Date('2024-01-01'),
      }

      await expect(createCreditAgreement(invalidAgreement))
        .rejects.toThrow('Maturity date must be after start date')
    })

    it('should validate positive amount and interest rate', async () => {
      mockPrisma.borrower.findUnique.mockResolvedValueOnce(mockBorrower)
      mockPrisma.lender.findUnique.mockResolvedValueOnce(mockLender)
      const invalidAgreement = {
        ...mockAgreement,
        amount: -1000,
      }

      await expect(createCreditAgreement(invalidAgreement))
        .rejects.toThrow('Amount must be positive')
    })

    it('should validate at least one facility is provided', async () => {
      mockPrisma.borrower.findUnique.mockResolvedValueOnce(mockBorrower)
      mockPrisma.lender.findUnique.mockResolvedValueOnce(mockLender)
      const invalidAgreement = {
        ...mockAgreement,
        facilities: [],
      }

      await expect(createCreditAgreement(invalidAgreement))
        .rejects.toThrow('At least one facility is required')
    })
  })

  describe('updateCreditAgreement', () => {
    const existingAgreement = {
      id: 'ca-1',
      agreementNumber: 'CA-2024-001',
      borrowerId: 'borrower-1',
      lenderId: 'lender-1',
      status: 'PENDING',
      amount: 2000000,
      currency: 'USD',
      startDate: new Date('2024-01-01'),
      maturityDate: new Date('2025-01-01'),
      interestRate: 5.5,
      description: 'Test credit agreement',
      createdAt: new Date(),
      updatedAt: new Date(),
      facilities: [{
        id: 'facility-1',
        facilityName: 'Term Loan A',
        facilityType: 'TERM_LOAN',
        commitmentAmount: 1000000,
        currency: 'USD',
        startDate: new Date('2024-01-01'),
        maturityDate: new Date('2025-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
    }

    it('should update credit agreement details while preserving facility relationships', async () => {
      mockPrisma.creditAgreement.findUnique.mockResolvedValueOnce(existingAgreement)
      
      const updateData = {
        id: 'ca-1',
        amount: 2500000,
        description: 'Updated description',
      }

      const updatedAgreement = {
        ...existingAgreement,
        ...updateData,
      }

      mockPrisma.creditAgreement.update.mockResolvedValueOnce(updatedAgreement)

      const result = await updateCreditAgreement(updateData)

      expect(result).toEqual(updatedAgreement)
      expect(mockPrisma.creditAgreement.update).toHaveBeenCalledTimes(1)
    })

    it('should reject updates that would make facility commitments exceed new credit agreement amount', async () => {
      mockPrisma.creditAgreement.findUnique.mockResolvedValueOnce({
        ...existingAgreement,
        facilities: [{
          ...existingAgreement.facilities[0],
          commitmentAmount: 1500000,
        }],
      })

      const updateData = {
        id: 'ca-1',
        amount: 1000000,
      }

      await expect(updateCreditAgreement(updateData))
        .rejects.toThrow('Credit agreement amount cannot be less than total facility commitments')

      expect(mockPrisma.creditAgreement.update).not.toHaveBeenCalled()
    })

    it('should reject updates that would make facility maturity dates invalid', async () => {
      mockPrisma.creditAgreement.findUnique.mockResolvedValueOnce({
        ...existingAgreement,
        facilities: [{
          ...existingAgreement.facilities[0],
          maturityDate: new Date('2025-01-01'),
        }],
      })

      const updateData = {
        id: 'ca-1',
        maturityDate: new Date('2024-12-31'),
      }

      await expect(updateCreditAgreement(updateData))
        .rejects.toThrow('Credit agreement maturity date cannot be earlier than facility maturity dates')

      expect(mockPrisma.creditAgreement.update).not.toHaveBeenCalled()
    })

    it('should reject currency changes when facilities exist', async () => {
      mockPrisma.creditAgreement.findUnique.mockResolvedValueOnce({
        ...existingAgreement,
        facilities: existingAgreement.facilities,
      })

      const updateData = {
        id: 'ca-1',
        currency: 'EUR',
      }

      await expect(updateCreditAgreement(updateData))
        .rejects.toThrow('Cannot change currency of credit agreement with existing facilities')

      expect(mockPrisma.creditAgreement.update).not.toHaveBeenCalled()
    })
  })
}) 