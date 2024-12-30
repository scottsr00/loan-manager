import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { createCreditAgreement } from '@/server/actions/loan/createCreditAgreement'
import { updateCreditAgreement } from '@/server/actions/loan/updateCreditAgreement'
import { type UpdateCreditAgreementInput } from '@/server/types/credit-agreement'
import { type PrismaClient } from '@prisma/client'

const mockPrisma = {
  $transaction: jest.fn(),
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
} as const

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
    }

    const mockLender = {
      id: 'lender-1',
      legalName: 'Test Bank',
      status: 'ACTIVE',
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
      facilities: [{
        facilityName: 'Term Loan A',
        facilityType: 'TERM_LOAN',
        commitmentAmount: 1000000,
        availableAmount: 1000000,
        currency: 'USD',
        startDate: new Date('2024-01-01'),
        maturityDate: new Date('2025-01-01'),
        interestType: 'FLOATING',
        baseRate: 'SOFR',
        margin: 2.5,
        description: 'Test facility',
      }]
    }

    it('should create a credit agreement with valid inputs', async () => {
      mockPrisma.borrower.findUnique.mockResolvedValueOnce(mockBorrower)
      mockPrisma.lender.findUnique.mockResolvedValueOnce(mockLender)
      mockPrisma.creditAgreement.create.mockResolvedValueOnce({
        id: 'ca-1',
        ...mockAgreement,
      })

      const result = await createCreditAgreement(mockAgreement)

      expect(result).toHaveProperty('id', 'ca-1')
      expect(result.borrowerId).toBe('borrower-1')
      expect(result.lenderId).toBe('lender-1')
      expect(mockPrisma.creditAgreement.create).toHaveBeenCalledTimes(1)
      expect(mockPrisma.creditAgreement.create).toHaveBeenCalledWith({
        data: {
          agreementNumber: mockAgreement.agreementNumber,
          borrower: {
            connect: {
              id: mockAgreement.borrowerId
            }
          },
          lender: {
            connect: {
              id: mockAgreement.lenderId
            }
          },
          status: mockAgreement.status,
          amount: mockAgreement.amount,
          currency: mockAgreement.currency,
          startDate: mockAgreement.startDate,
          maturityDate: mockAgreement.maturityDate,
          interestRate: mockAgreement.interestRate,
          description: mockAgreement.description,
          facilities: {
            create: mockAgreement.facilities.map(facility => ({
              ...facility,
              availableAmount: facility.commitmentAmount,
            }))
          }
        },
        include: {
          borrower: true,
          lender: true,
          facilities: {
            include: {
              trades: {
                include: {
                  counterparty: true,
                },
              },
            },
          },
          transactions: true,
        },
      })
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
      const invalidAgreement = {
        ...mockAgreement,
        startDate: new Date('2025-01-01'),
        maturityDate: new Date('2024-01-01'),
      }

      await expect(createCreditAgreement(invalidAgreement))
        .rejects.toThrow('Maturity date must be after start date')

      expect(mockPrisma.creditAgreement.create).not.toHaveBeenCalled()
    })

    it('should validate positive amount and interest rate', async () => {
      const invalidAgreement = {
        ...mockAgreement,
        amount: -1000,
        interestRate: -1,
      }

      await expect(createCreditAgreement(invalidAgreement))
        .rejects.toThrow(/Amount must be positive|Interest rate must be non-negative/)

      expect(mockPrisma.creditAgreement.create).not.toHaveBeenCalled()
    })

    it('should validate at least one facility is provided', async () => {
      const invalidAgreement = {
        ...mockAgreement,
        facilities: [],
      }

      await expect(createCreditAgreement(invalidAgreement))
        .rejects.toThrow('At least one facility is required')

      expect(mockPrisma.creditAgreement.create).not.toHaveBeenCalled()
    })
  })

  describe('updateCreditAgreement', () => {
    const mockExistingAgreement = {
      id: 'test-ca-1',
      agreementNumber: 'CA-TEST-001',
      amount: 1000000,
      currency: 'USD',
      startDate: new Date('2024-01-01'),
      maturityDate: new Date('2025-01-01'),
      interestRate: 5.5,
      description: 'Test credit agreement',
      status: 'ACTIVE',
      borrowerId: 'test-borrower-1',
      lenderId: 'test-lender-1',
      facilities: [],
      borrower: {
        id: 'test-borrower-1',
        name: 'Test Borrower',
        onboardingStatus: 'ACTIVE',
      },
      lender: {
        id: 'test-lender-1',
        legalName: 'Test Lender',
        status: 'ACTIVE',
      },
      transactions: [],
    }

    const mockFacility = {
      id: 'test-facility-1',
      facilityName: 'Term Loan A',
      facilityType: 'TERM_LOAN',
      commitmentAmount: 500000,
      availableAmount: 500000,
      currency: 'USD',
      startDate: new Date('2024-01-01'),
      maturityDate: new Date('2025-01-01'),
      interestType: 'FLOATING',
      baseRate: 'SOFR',
      margin: 2.5,
      description: 'Test facility',
      status: 'ACTIVE',
      creditAgreementId: 'test-ca-1',
      trades: [],
    }

    it('should update credit agreement details while preserving facility relationships', async () => {
      const updateData: UpdateCreditAgreementInput = {
        id: mockExistingAgreement.id,
        agreementNumber: 'CA-TEST-001-UPDATED',
        amount: 1500000,
        currency: 'USD',
        startDate: new Date('2024-01-01'),
        maturityDate: new Date('2025-01-01'),
        interestRate: 6.0,
        description: 'Updated agreement',
        status: 'ACTIVE',
        borrowerId: mockExistingAgreement.borrowerId,
      }

      const mockUpdatedAgreement = {
        ...mockExistingAgreement,
        ...updateData,
        facilities: [mockFacility],
      }

      mockPrisma.creditAgreement.findUnique.mockResolvedValueOnce({
        ...mockExistingAgreement,
        facilities: [mockFacility],
      })
      mockPrisma.creditAgreement.update.mockResolvedValueOnce(mockUpdatedAgreement)

      const result = await updateCreditAgreement(updateData)

      expect(result).toBeDefined()
      expect(result.agreementNumber).toBe(updateData.agreementNumber)
      expect(result.amount).toBe(updateData.amount)
      expect(result.facilities).toHaveLength(1)
      expect(result.facilities[0].id).toBe(mockFacility.id)
      expect(mockPrisma.creditAgreement.update).toHaveBeenCalledWith({
        where: { id: updateData.id },
        data: {
          agreementNumber: updateData.agreementNumber,
          status: updateData.status,
          amount: updateData.amount,
          currency: updateData.currency,
          startDate: updateData.startDate,
          maturityDate: updateData.maturityDate,
          interestRate: updateData.interestRate,
          description: updateData.description,
          borrowerId: updateData.borrowerId,
        },
        include: {
          borrower: true,
          lender: true,
          facilities: {
            include: {
              trades: {
                include: {
                  counterparty: true,
                },
              },
            },
          },
          transactions: true,
        },
      })
    })

    it('should reject updates that would make facility commitments exceed new credit agreement amount', async () => {
      const updateData: UpdateCreditAgreementInput = {
        id: mockExistingAgreement.id,
        amount: 400000, // Less than facility commitment
        currency: 'USD',
        startDate: new Date('2024-01-01'),
        maturityDate: new Date('2025-01-01'),
        status: 'ACTIVE',
        borrowerId: mockExistingAgreement.borrowerId,
        agreementNumber: mockExistingAgreement.agreementNumber,
        interestRate: mockExistingAgreement.interestRate,
      }

      mockPrisma.creditAgreement.findUnique.mockResolvedValueOnce({
        ...mockExistingAgreement,
        facilities: [mockFacility],
      })

      await expect(updateCreditAgreement(updateData))
        .rejects.toThrow('Credit agreement amount cannot be less than total facility commitments')

      expect(mockPrisma.creditAgreement.update).not.toHaveBeenCalled()
    })

    it('should reject updates that would make facility maturity dates invalid', async () => {
      const updateData: UpdateCreditAgreementInput = {
        id: mockExistingAgreement.id,
        maturityDate: new Date('2024-06-01'), // Earlier than facility maturity
        currency: 'USD',
        startDate: new Date('2024-01-01'),
        status: 'ACTIVE',
        borrowerId: mockExistingAgreement.borrowerId,
        agreementNumber: mockExistingAgreement.agreementNumber,
        amount: mockExistingAgreement.amount,
        interestRate: mockExistingAgreement.interestRate,
      }

      mockPrisma.creditAgreement.findUnique.mockResolvedValueOnce({
        ...mockExistingAgreement,
        facilities: [mockFacility],
      })

      await expect(updateCreditAgreement(updateData))
        .rejects.toThrow('Credit agreement maturity date cannot be earlier than facility maturity dates')

      expect(mockPrisma.creditAgreement.update).not.toHaveBeenCalled()
    })

    it('should reject currency changes when facilities exist', async () => {
      const updateData: UpdateCreditAgreementInput = {
        id: mockExistingAgreement.id,
        currency: 'EUR', // Different currency
        startDate: new Date('2024-01-01'),
        maturityDate: new Date('2025-01-01'),
        status: 'ACTIVE',
        borrowerId: mockExistingAgreement.borrowerId,
        agreementNumber: mockExistingAgreement.agreementNumber,
        amount: mockExistingAgreement.amount,
        interestRate: mockExistingAgreement.interestRate,
      }

      mockPrisma.creditAgreement.findUnique.mockResolvedValueOnce({
        ...mockExistingAgreement,
        facilities: [mockFacility],
      })

      await expect(updateCreditAgreement(updateData))
        .rejects.toThrow('Cannot change currency of credit agreement with existing facilities')

      expect(mockPrisma.creditAgreement.update).not.toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      const invalidData: UpdateCreditAgreementInput = {
        id: mockExistingAgreement.id,
        amount: -1000, // Invalid amount
        currency: 'USD',
        startDate: new Date('2024-01-01'),
        maturityDate: new Date('2025-01-01'),
        status: 'ACTIVE',
        borrowerId: mockExistingAgreement.borrowerId,
        agreementNumber: mockExistingAgreement.agreementNumber,
        interestRate: mockExistingAgreement.interestRate,
      }

      mockPrisma.creditAgreement.findUnique.mockResolvedValueOnce(mockExistingAgreement)

      await expect(updateCreditAgreement(invalidData))
        .rejects.toThrow('Amount must be positive')

      expect(mockPrisma.creditAgreement.update).not.toHaveBeenCalled()
    })
  })
}) 