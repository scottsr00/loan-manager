import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { createLoan } from '@/server/actions/loan/createLoan'
import { PrismaClient } from '@prisma/client'

type MockPrismaClient = {
  facility: {
    findUnique: jest.Mock
  }
  $queryRaw: jest.Mock
  transactionHistory: {
    create: jest.Mock
  }
}

// Mock the entire prisma module
jest.mock('@/server/db/client', () => {
  const mockTx: MockPrismaClient = {
    facility: {
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn(),
    transactionHistory: {
      create: jest.fn(),
    },
  }

  return {
    prisma: {
      $transaction: jest.fn((fn: (tx: MockPrismaClient) => Promise<unknown>) => fn(mockTx)),
    },
  }
})

// Get the mocked prisma instance
const { prisma } = jest.requireMock('@/server/db/client') as { prisma: { $transaction: jest.Mock } }

describe('createLoan', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('should create a loan successfully', async () => {
    // Mock facility data
    const mockFacility = {
      id: 'facility-1',
      currency: 'USD',
      commitmentAmount: 10000000,
      margin: 2.5,
      loans: []
    }

    // Mock loan data
    const mockLoan = {
      id: 'loan-1',
      facilityId: 'facility-1',
      amount: 5000000,
      outstandingAmount: 5000000,
      currency: 'USD',
      baseRate: 5,
      effectiveRate: 7.5,
      drawDate: new Date()
    }

    // Setup mock implementations
    const mockTx: MockPrismaClient = {
      facility: {
        findUnique: jest.fn().mockResolvedValue(mockFacility),
      },
      $queryRaw: jest.fn()
        .mockResolvedValueOnce([{ id: 'loan-1' }]) // For CUID generation
        .mockResolvedValueOnce([mockLoan]), // For loan creation
      transactionHistory: {
        create: jest.fn().mockResolvedValue({}),
      },
    }

    prisma.$transaction.mockImplementation((fn: (tx: MockPrismaClient) => Promise<unknown>) => fn(mockTx))

    // Test data
    const loanParams = {
      facilityId: 'facility-1',
      amount: 5000000,
      currency: 'USD',
      effectiveDate: new Date(),
      interestPeriod: '1M' as const,
      baseRate: 5,
      effectiveRate: 7.5
    }

    // Execute test
    const result = await createLoan(loanParams)

    // Assertions
    expect(result).toBeDefined()
    expect(result.id).toBe('loan-1')
    expect(result.amount).toBe(5000000)
    expect(result.effectiveRate).toBe(7.5)

    // Verify facility was checked
    expect(mockTx.facility.findUnique).toHaveBeenCalledWith({
      where: { id: 'facility-1' },
      include: { loans: true }
    })

    // Verify loan was created
    expect(mockTx.$queryRaw).toHaveBeenCalledTimes(2)

    // Verify transaction history was created
    expect(mockTx.transactionHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        loan: { connect: { id: 'loan-1' } },
        activityType: 'LOAN_DRAWDOWN',
        amount: 5000000,
        currency: 'USD',
        status: 'COMPLETED'
      })
    })
  })

  it('should throw error if facility not found', async () => {
    const mockTx: MockPrismaClient = {
      facility: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $queryRaw: jest.fn(),
      transactionHistory: {
        create: jest.fn(),
      },
    }

    prisma.$transaction.mockImplementation((fn: (tx: MockPrismaClient) => Promise<unknown>) => fn(mockTx))

    const loanParams = {
      facilityId: 'non-existent',
      amount: 5000000,
      currency: 'USD',
      effectiveDate: new Date(),
      interestPeriod: '1M' as const,
      baseRate: 5,
      effectiveRate: 7.5
    }

    await expect(createLoan(loanParams)).rejects.toThrow('Facility not found')
  })

  it('should throw error if currency mismatch', async () => {
    const mockTx: MockPrismaClient = {
      facility: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'facility-1',
          currency: 'EUR',
          commitmentAmount: 10000000,
          margin: 2.5,
          loans: []
        }),
      },
      $queryRaw: jest.fn(),
      transactionHistory: {
        create: jest.fn(),
      },
    }

    prisma.$transaction.mockImplementation((fn: (tx: MockPrismaClient) => Promise<unknown>) => fn(mockTx))

    const loanParams = {
      facilityId: 'facility-1',
      amount: 5000000,
      currency: 'USD',
      effectiveDate: new Date(),
      interestPeriod: '1M' as const,
      baseRate: 5,
      effectiveRate: 7.5
    }

    await expect(createLoan(loanParams)).rejects.toThrow('Currency mismatch')
  })

  it('should throw error if insufficient available amount', async () => {
    const mockTx: MockPrismaClient = {
      facility: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'facility-1',
          currency: 'USD',
          commitmentAmount: 10000000,
          margin: 2.5,
          loans: [
            { outstandingAmount: 8000000 }
          ]
        }),
      },
      $queryRaw: jest.fn(),
      transactionHistory: {
        create: jest.fn(),
      },
    }

    prisma.$transaction.mockImplementation((fn: (tx: MockPrismaClient) => Promise<unknown>) => fn(mockTx))

    const loanParams = {
      facilityId: 'facility-1',
      amount: 5000000,
      currency: 'USD',
      effectiveDate: new Date(),
      interestPeriod: '1M' as const,
      baseRate: 5,
      effectiveRate: 7.5
    }

    await expect(createLoan(loanParams)).rejects.toThrow('Insufficient available amount')
  })
}) 