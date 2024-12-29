import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { createLoan } from '@/server/actions/loan/createLoan'

// Mock the prisma module
jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}))

// Get the mocked prisma instance
const { prisma } = jest.requireMock('@/server/db/client')

describe('createLoan', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a loan successfully', async () => {
    // Mock data
    const mockFacility = {
      id: 'facility-1',
      currency: 'USD',
      commitmentAmount: 10000000,
      margin: 2.5,
      loans: []
    }

    const mockLoan = {
      id: 'loan-1',
      facilityId: 'facility-1',
      amount: 5000000,
      outstandingAmount: 5000000,
      currency: 'USD',
      baseRate: 5,
      effectiveRate: 7.5,
      drawDate: new Date(),
      status: 'ACTIVE',
      interestPeriod: '1M'
    }

    // Setup mock transaction
    const mockTx = {
      facility: {
        findUnique: jest.fn().mockResolvedValue(mockFacility)
      },
      loan: {
        create: jest.fn().mockResolvedValue(mockLoan)
      },
      $queryRaw: jest.fn()
        .mockResolvedValueOnce([{ id: 'loan-1' }])
        .mockResolvedValueOnce([mockLoan]),
      transactionHistory: {
        create: jest.fn().mockResolvedValue({})
      }
    }

    prisma.$transaction.mockImplementation(fn => fn(mockTx))

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
    const mockTx = {
      facility: {
        findUnique: jest.fn().mockResolvedValue(null)
      },
      loan: {
        create: jest.fn()
      },
      $queryRaw: jest.fn(),
      transactionHistory: {
        create: jest.fn()
      }
    }

    prisma.$transaction.mockImplementation(fn => fn(mockTx))

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
    const mockTx = {
      facility: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'facility-1',
          currency: 'EUR',
          commitmentAmount: 10000000,
          margin: 2.5,
          loans: []
        })
      },
      loan: {
        create: jest.fn()
      },
      $queryRaw: jest.fn(),
      transactionHistory: {
        create: jest.fn()
      }
    }

    prisma.$transaction.mockImplementation(fn => fn(mockTx))

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
    const mockTx = {
      facility: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'facility-1',
          currency: 'USD',
          commitmentAmount: 10000000,
          margin: 2.5,
          loans: [
            { outstandingAmount: 8000000 }
          ]
        })
      },
      loan: {
        create: jest.fn()
      },
      $queryRaw: jest.fn(),
      transactionHistory: {
        create: jest.fn()
      }
    }

    prisma.$transaction.mockImplementation(fn => fn(mockTx))

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