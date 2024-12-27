import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/server/db/client'
import { createCreditAgreement } from '@/server/actions/loan/createCreditAgreement'
import { updateCreditAgreement } from '@/server/actions/loan/updateCreditAgreement'

type MockPrisma = {
  [K in keyof PrismaClient]: {
    [M in keyof PrismaClient[K]]: jest.Mock;
  };
};

jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn((callback: (tx: MockPrisma) => Promise<unknown>) => callback(prisma as unknown as MockPrisma)),
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
  } as unknown as MockPrisma,
}))

describe('Credit Agreement Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCreditAgreement', () => {
    const mockBorrower = {
      id: 'borrower-1',
      legalName: 'Test Borrower Inc',
      status: 'ACTIVE',
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
      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue(mockBorrower)
      ;(prisma.lender.findUnique as jest.Mock).mockResolvedValue(mockLender)
      ;(prisma.creditAgreement.create as jest.Mock).mockResolvedValue({
        id: 'ca-1',
        ...mockAgreement,
      })

      const result = await createCreditAgreement(mockAgreement)

      expect(result).toHaveProperty('id', 'ca-1')
      expect(result.borrowerId).toBe('borrower-1')
      expect(result.lenderId).toBe('lender-1')
      expect(prisma.creditAgreement.create).toHaveBeenCalledTimes(1)
      expect(prisma.creditAgreement.create).toHaveBeenCalledWith({
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
          borrower: {
            include: {
              borrower: true,
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
          lender: {
            include: {
              lender: true,
            },
          },
          transactions: true,
        },
      })
    })

    it('should throw error if borrower does not exist', async () => {
      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.lender.findUnique as jest.Mock).mockResolvedValue(mockLender)

      await expect(createCreditAgreement(mockAgreement))
        .rejects.toThrow('Borrower not found')

      expect(prisma.creditAgreement.create).not.toHaveBeenCalled()
    })

    it('should throw error if lender does not exist', async () => {
      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue(mockBorrower)
      ;(prisma.lender.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(createCreditAgreement(mockAgreement))
        .rejects.toThrow('Lender not found')

      expect(prisma.creditAgreement.create).not.toHaveBeenCalled()
    })

    it('should validate maturity date is after start date', async () => {
      const invalidAgreement = {
        ...mockAgreement,
        startDate: new Date('2025-01-01'),
        maturityDate: new Date('2024-01-01'),
      }

      await expect(createCreditAgreement(invalidAgreement))
        .rejects.toThrow('Maturity date must be after start date')

      expect(prisma.creditAgreement.create).not.toHaveBeenCalled()
    })

    it('should validate positive amount and interest rate', async () => {
      const invalidAgreement = {
        ...mockAgreement,
        amount: -1000,
        interestRate: -1,
      }

      await expect(createCreditAgreement(invalidAgreement))
        .rejects.toThrow(/Amount must be positive|Interest rate must be non-negative/)

      expect(prisma.creditAgreement.create).not.toHaveBeenCalled()
    })

    it('should validate at least one facility is provided', async () => {
      const invalidAgreement = {
        ...mockAgreement,
        facilities: [],
      }

      await expect(createCreditAgreement(invalidAgreement))
        .rejects.toThrow('At least one facility is required')

      expect(prisma.creditAgreement.create).not.toHaveBeenCalled()
    })
  })

  describe('updateCreditAgreement', () => {
    const mockExistingAgreement = {
      id: 'ca-1',
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
        id: 'facility-1',
        facilityName: 'Term Loan A',
        facilityType: 'TERM_LOAN',
        commitmentAmount: 800000,
        currency: 'USD',
        startDate: new Date('2024-01-01'),
        maturityDate: new Date('2025-01-01'),
        interestType: 'FLOATING',
        baseRate: 'SOFR',
        margin: 2.5,
        description: 'Test facility',
      }]
    }

    it('should update credit agreement with valid changes', async () => {
      ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue(mockExistingAgreement)
      ;(prisma.creditAgreement.update as jest.Mock).mockResolvedValue({
        ...mockExistingAgreement,
        status: 'ACTIVE',
        amount: 1500000,
      })

      const result = await updateCreditAgreement({
        ...mockExistingAgreement,
        status: 'ACTIVE',
        amount: 1500000,
      })

      expect(result.status).toBe('ACTIVE')
      expect(result.amount).toBe(1500000)
      expect(prisma.creditAgreement.update).toHaveBeenCalledTimes(1)
    })

    it('should throw error if agreement does not exist', async () => {
      ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(updateCreditAgreement({
        ...mockExistingAgreement,
        id: 'non-existent',
      })).rejects.toThrow('Credit agreement not found')

      expect(prisma.creditAgreement.update).not.toHaveBeenCalled()
    })

    it('should validate status transitions', async () => {
      ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingAgreement,
        status: 'TERMINATED',
      })

      await expect(updateCreditAgreement({
        ...mockExistingAgreement,
        status: 'ACTIVE',
      })).rejects.toThrow('Cannot change status of terminated agreement')

      expect(prisma.creditAgreement.update).not.toHaveBeenCalled()
    })

    it('should validate amount changes', async () => {
      ;(prisma.creditAgreement.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingAgreement,
        status: 'ACTIVE',
      })

      await expect(updateCreditAgreement({
        ...mockExistingAgreement,
        amount: -1000,
      })).rejects.toThrow('Amount must be positive')

      expect(prisma.creditAgreement.update).not.toHaveBeenCalled()
    })
  })
}) 