import { prisma } from '@/server/db/client'
import { createLoan } from '@/server/actions/loan/createLoan'
import { updateLoan } from '@/server/actions/loan/updateLoan'
import { z } from 'zod'

// Mock Prisma client
jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn((callback) => {
      const mockTx = {
        loan: {
          create: jest.fn().mockResolvedValue({
            id: 'loan-1',
            facilityId: 'facility-1',
            amount: 1000000,
            outstandingAmount: 1000000,
            currency: 'USD',
            status: 'ACTIVE',
            interestPeriod: '1M',
            drawDate: new Date(),
            baseRate: 4.5,
            effectiveRate: 7.0,
          }),
          update: jest.fn(),
          findUnique: jest.fn(),
        },
        facility: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'facility-1',
            commitmentAmount: 2000000,
            availableAmount: 2000000,
            currency: 'USD',
            loans: [],
          }),
        },
        transactionHistory: {
          create: jest.fn().mockResolvedValue({ id: 'transaction-1' }),
        },
      }
      return callback(mockTx)
    }),
    loan: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    facility: {
      findUnique: jest.fn(),
    },
    transactionHistory: {
      create: jest.fn(),
    },
  },
}))

describe('Loan Tests', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('createLoan', () => {
    const mockValidLoan = {
      amount: 1000000,
      status: 'ACTIVE',
      facilityId: 'facility-1',
      currency: 'USD',
      effectiveDate: new Date(),
      interestPeriod: '1M' as const,
      baseRate: 4.5,
      effectiveRate: 7.0,
    }

    it('should create a loan with valid inputs', async () => {
      const mockTx = {
        loan: {
          create: jest.fn().mockResolvedValue({
            id: 'loan-1',
            facilityId: 'facility-1',
            amount: 1000000,
            outstandingAmount: 1000000,
            currency: 'USD',
            status: 'ACTIVE',
            interestPeriod: '1M',
            drawDate: new Date(),
            baseRate: 4.5,
            effectiveRate: 7.0,
          }),
        },
        facility: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'facility-1',
            commitmentAmount: 2000000,
            availableAmount: 2000000,
            currency: 'USD',
            loans: [],
          }),
        },
        transactionHistory: {
          create: jest.fn().mockResolvedValue({ id: 'transaction-1' }),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(mockTx))

      const result = await createLoan(mockValidLoan)

      expect(result).toHaveProperty('id', 'loan-1')
      expect(result.amount).toBe(1000000)
      expect(result.status).toBe('ACTIVE')
      expect(result.interestPeriod).toBe('1M')
      expect(result.baseRate).toBe(4.5)
      expect(result.effectiveRate).toBe(7.0)

      // Verify transaction history creation
      expect(mockTx.transactionHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            activityType: 'LOAN_DRAWDOWN',
            amount: mockValidLoan.amount,
            currency: mockValidLoan.currency,
          }),
        })
      )
    })

    it('should validate required fields', async () => {
      // Mock facility to return null for invalid facility ID
      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) => {
        return callback({
          loan: {
            create: jest.fn(),
          },
          facility: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
          transactionHistory: {
            create: jest.fn(),
          },
        })
      })

      const invalidLoan = {
        ...mockValidLoan,
        facilityId: '',
        amount: 0,
      }

      await expect(createLoan(invalidLoan))
        .rejects.toThrow('Facility not found')

      expect(prisma.loan.create).not.toHaveBeenCalled()
      expect(prisma.transactionHistory.create).not.toHaveBeenCalled()
    })

    it('should validate loan amount does not exceed available amount', async () => {
      // Mock facility with less available amount
      const mockFacility = {
        id: 'facility-1',
        commitmentAmount: 2000000,
        availableAmount: 500000,
        currency: 'USD',
        loans: [
          {
            id: 'existing-loan-1',
            amount: 1500000,
            outstandingAmount: 1500000,
            currency: 'USD',
            status: 'ACTIVE',
          }
        ],
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) => {
        return callback({
          loan: {
            create: jest.fn(),
          },
          facility: {
            findUnique: jest.fn().mockResolvedValue(mockFacility),
          },
          transactionHistory: {
            create: jest.fn(),
          },
        })
      })

      const invalidLoan = {
        ...mockValidLoan,
        amount: 1000000, // More than available (500000)
      }

      await expect(createLoan(invalidLoan))
        .rejects.toThrow('Insufficient available amount')

      expect(prisma.loan.create).not.toHaveBeenCalled()
      expect(prisma.transactionHistory.create).not.toHaveBeenCalled()
    })

    it('should validate currency matches facility', async () => {
      // Mock facility with different currency
      const mockFacility = {
        id: 'facility-1',
        commitmentAmount: 2000000,
        availableAmount: 2000000,
        currency: 'EUR',
        loans: [],
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) => {
        return callback({
          loan: {
            create: jest.fn(),
          },
          facility: {
            findUnique: jest.fn().mockResolvedValue(mockFacility),
          },
          transactionHistory: {
            create: jest.fn(),
          },
        })
      })

      const invalidLoan = {
        ...mockValidLoan,
        currency: 'USD',
      }

      await expect(createLoan(invalidLoan))
        .rejects.toThrow('Currency mismatch')

      expect(prisma.loan.create).not.toHaveBeenCalled()
      expect(prisma.transactionHistory.create).not.toHaveBeenCalled()
    })
  })

  describe('updateLoan', () => {
    const mockExistingLoan = {
      id: 'loan-1',
      facilityId: 'facility-1',
      amount: 1000000,
      outstandingAmount: 800000,
      currency: 'USD',
      status: 'ACTIVE',
      interestPeriod: '1M',
      drawDate: new Date(),
      baseRate: 4.5,
      effectiveRate: 7.0,
      facility: {
        id: 'facility-1',
        creditAgreement: {
          id: 'ca-1'
        }
      },
    }

    it('should update loan with valid changes', async () => {
      const mockTx = {
        loan: {
          update: jest.fn().mockImplementation((args) => Promise.resolve({ ...mockExistingLoan, ...args.data })),
          findUnique: jest.fn().mockResolvedValue(mockExistingLoan)
        },
        transactionHistory: {
          create: jest.fn().mockResolvedValue({ id: 'transaction-1' })
        }
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(mockTx))
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockExistingLoan)

      const updateData = {
        id: mockExistingLoan.id,
        amount: 800000,
        status: 'PARTIALLY_PAID' as const,
      }

      const result = await updateLoan(updateData)

      expect(result.amount).toBe(updateData.amount)
      expect(result.status).toBe(updateData.status)
      expect(consoleErrorSpy).not.toHaveBeenCalled()

      // Verify transaction history creation
      expect(mockTx.transactionHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            activityType: 'LOAN_UPDATE',
            loanId: mockExistingLoan.id,
            creditAgreementId: mockExistingLoan.facility.creditAgreement.id,
          }),
        })
      )
    })

    it('should throw error if loan does not exist', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(updateLoan({
        id: 'non-existent',
        status: 'ACTIVE' as const,
      })).rejects.toThrow('Loan not found')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating loan:',
        'Loan not found'
      )
      expect(prisma.transactionHistory.create).not.toHaveBeenCalled()
    })

    it('should validate status transitions', async () => {
      const mockClosedLoan = {
        ...mockExistingLoan,
        status: 'CLOSED' as const,
      }

      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockClosedLoan)

      await expect(updateLoan({
        id: mockClosedLoan.id,
        status: 'ACTIVE' as const,
      })).rejects.toThrow('Cannot reactivate closed loan')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating loan:',
        'Cannot reactivate closed loan'
      )
      expect(prisma.transactionHistory.create).not.toHaveBeenCalled()
    })

    it('should validate amount is not greater than original amount', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockExistingLoan)

      await expect(updateLoan({
        id: mockExistingLoan.id,
        amount: mockExistingLoan.amount + 1000,
      })).rejects.toThrow('Amount cannot exceed original loan amount')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating loan:',
        'Amount cannot exceed original loan amount'
      )
      expect(prisma.transactionHistory.create).not.toHaveBeenCalled()
    })
  })
}) 