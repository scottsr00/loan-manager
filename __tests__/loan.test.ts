import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/server/db/client'
import { createLoan, updateLoan } from '@/server/actions/loan'

type MockPrisma = {
  [K in keyof PrismaClient]: {
    [M in keyof PrismaClient[K]]: jest.Mock;
  };
};

jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn((callback: (tx: MockPrisma) => Promise<any>) => callback(prisma as unknown as MockPrisma)),
    loan: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    loanPosition: {
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as MockPrisma,
}))

describe('Loan Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createLoan', () => {
    const mockLoan = {
      facilityId: 'facility-1',
      amount: 1000000,
      outstandingAmount: 1000000,
      currency: 'USD',
      status: 'ACTIVE',
      positions: [
        {
          lenderId: 'lender-1',
          amount: 1000000,
          status: 'ACTIVE',
        },
      ],
    }

    it('should create a loan with valid inputs', async () => {
      const mockCreatedLoan = {
        id: 'loan-1',
        ...mockLoan,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.loan.create as jest.Mock).mockResolvedValue(mockCreatedLoan)
      ;(prisma.loanPosition.create as jest.Mock).mockResolvedValue({
        id: 'pos-1',
        loanId: 'loan-1',
        ...mockLoan.positions[0],
      })

      const result = await createLoan(mockLoan)

      expect(result).toHaveProperty('id', 'loan-1')
      expect(result.amount).toBe(mockLoan.amount)
      expect(prisma.loan.create).toHaveBeenCalledTimes(1)
      expect(prisma.loanPosition.create).toHaveBeenCalledTimes(1)
    })

    it('should validate required fields', async () => {
      const invalidLoan = {
        facilityId: '',
        amount: 0,
        outstandingAmount: 0,
        positions: [],
      }

      await expect(createLoan(invalidLoan))
        .rejects.toThrow(/Facility ID is required|Amount must be positive|At least one position is required/)

      expect(prisma.loan.create).not.toHaveBeenCalled()
      expect(prisma.loanPosition.create).not.toHaveBeenCalled()
    })

    it('should validate position amounts match loan amount', async () => {
      const invalidLoan = {
        ...mockLoan,
        amount: 1000000,
        positions: [
          {
            lenderId: 'lender-1',
            amount: 900000, // Less than loan amount
            status: 'ACTIVE',
          },
        ],
      }

      await expect(createLoan(invalidLoan))
        .rejects.toThrow('Position amounts must equal loan amount')

      expect(prisma.loan.create).not.toHaveBeenCalled()
      expect(prisma.loanPosition.create).not.toHaveBeenCalled()
    })

    it('should validate positive amounts', async () => {
      const invalidLoan = {
        ...mockLoan,
        amount: -1000000,
        outstandingAmount: -1000000,
        positions: [
          {
            lenderId: 'lender-1',
            amount: -1000000,
            status: 'ACTIVE',
          },
        ],
      }

      await expect(createLoan(invalidLoan))
        .rejects.toThrow(/Amount must be positive|Outstanding amount must be positive|Position amount must be positive/)

      expect(prisma.loan.create).not.toHaveBeenCalled()
      expect(prisma.loanPosition.create).not.toHaveBeenCalled()
    })
  })

  describe('updateLoan', () => {
    const mockExistingLoan = {
      id: 'loan-1',
      facilityId: 'facility-1',
      amount: 1000000,
      outstandingAmount: 1000000,
      currency: 'USD',
      status: 'ACTIVE',
      positions: [
        {
          id: 'pos-1',
          lenderId: 'lender-1',
          amount: 1000000,
          status: 'ACTIVE',
        },
      ],
    }

    it('should update loan with valid changes', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockExistingLoan)
      ;(prisma.loan.update as jest.Mock).mockResolvedValue({
        ...mockExistingLoan,
        amount: 900000,
        status: 'PARTIALLY_PAID',
      })

      const result = await updateLoan({
        id: 'loan-1',
        amount: 900000,
        status: 'PARTIALLY_PAID',
      })

      expect(result.amount).toBe(900000)
      expect(result.status).toBe('PARTIALLY_PAID')
      expect(prisma.loan.update).toHaveBeenCalledTimes(1)
    })

    it('should throw error if loan does not exist', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(updateLoan({
        id: 'non-existent',
        amount: 900000,
      })).rejects.toThrow('Loan not found')

      expect(prisma.loan.update).not.toHaveBeenCalled()
    })

    it('should validate status transitions', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingLoan,
        status: 'CLOSED',
      })

      await expect(updateLoan({
        id: 'loan-1',
        status: 'ACTIVE',
      })).rejects.toThrow('Cannot reactivate closed loan')

      expect(prisma.loan.update).not.toHaveBeenCalled()
    })

    it('should validate amount is not greater than original amount', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockExistingLoan)

      await expect(updateLoan({
        id: 'loan-1',
        amount: 1100000, // Greater than original amount
      })).rejects.toThrow('Amount cannot exceed original loan amount')

      expect(prisma.loan.update).not.toHaveBeenCalled()
    })
  })
}) 