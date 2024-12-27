import { prisma } from '@/server/db/client'
import { updateCreditAgreement } from '@/server/actions/loan/updateCreditAgreement'
import { type UpdateCreditAgreementInput } from '@/server/types/credit-agreement'

// Mock Prisma client
jest.mock('@/server/db/client', () => ({
  prisma: {
    creditAgreement: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    facility: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}))

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})

describe('Credit Agreement Management', () => {
  describe('Credit Agreement Updates', () => {
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
      borrowerId: 'test-entity-1',
      lenderId: 'test-entity-2',
      facilities: [],
      borrower: {
        id: 'test-entity-1',
        borrower: {
          name: 'Test Borrower',
        },
      },
      lender: {
        id: 'test-entity-2',
        lender: {
          name: 'Test Lender',
        },
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

      ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingAgreement,
        facilities: [mockFacility],
      })
      ;(prisma.creditAgreement.update as jest.Mock).mockResolvedValue(mockUpdatedAgreement)

      const result = await updateCreditAgreement(updateData)

      expect(result).toBeDefined()
      expect(result.agreementNumber).toBe(updateData.agreementNumber)
      expect(result.amount).toBe(updateData.amount)
      expect(result.facilities).toHaveLength(1)
      expect(result.facilities[0].id).toBe(mockFacility.id)
      expect(prisma.creditAgreement.update).toHaveBeenCalledWith({
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
          borrower: {
            include: {
              borrower: true,
            },
          },
          lender: {
            include: {
              lender: true,
            },
          },
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

      ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingAgreement,
        facilities: [mockFacility],
      })

      await expect(updateCreditAgreement(updateData))
        .rejects.toThrow('Credit agreement amount cannot be less than total facility commitments')

      expect(prisma.creditAgreement.update).not.toHaveBeenCalled()
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

      ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingAgreement,
        facilities: [mockFacility],
      })

      await expect(updateCreditAgreement(updateData))
        .rejects.toThrow('Credit agreement maturity date cannot be earlier than facility maturity dates')

      expect(prisma.creditAgreement.update).not.toHaveBeenCalled()
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

      ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingAgreement,
        facilities: [mockFacility],
      })

      await expect(updateCreditAgreement(updateData))
        .rejects.toThrow('Cannot change currency of credit agreement with existing facilities')

      expect(prisma.creditAgreement.update).not.toHaveBeenCalled()
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

      ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue(mockExistingAgreement)

      await expect(updateCreditAgreement(invalidData))
        .rejects.toThrow('Amount must be positive')

      expect(prisma.creditAgreement.update).not.toHaveBeenCalled()
    })
  })
}) 