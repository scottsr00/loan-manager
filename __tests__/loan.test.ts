import { prisma } from '@/server/db/client'
import { createLoan } from '@/server/actions/loan/createLoan'
import { updateLoan } from '@/server/actions/loan/updateLoan'
import { z } from 'zod'

const LoanPositionSchema = z.object({
  lenderId: z.string().min(1, 'Lender ID is required'),
  amount: z.number().positive('Position amount must be positive'),
  status: z.enum(['ACTIVE', 'CLOSED', 'DEFAULTED']).optional().default('ACTIVE')
})

export const CreateLoanSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().optional().default('USD'),
  status: z.enum(['ACTIVE', 'PARTIALLY_PAID', 'PAID', 'DEFAULTED', 'CLOSED']).optional().default('ACTIVE'),
  positions: z.array(LoanPositionSchema).min(1, 'At least one position is required')
}).refine(data => {
  const totalPositionAmount = data.positions.reduce((sum, pos) => sum + pos.amount, 0)
  return totalPositionAmount === data.amount
}, {
  message: 'Position amounts must equal loan amount',
  path: ['positions']
})

type CreateLoanInput = z.infer<typeof CreateLoanSchema>
type LoanPosition = z.infer<typeof LoanPositionSchema>

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
    // Spy on console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore()
  })

  describe('createLoan', () => {
    const mockValidLoan = {
      amount: 1000000,
      status: 'ACTIVE',
      facilityId: 'facility-1',
      currency: 'USD',
      effectiveDate: new Date(),
    }

    it('should create a loan with valid inputs', async () => {
      const result = await createLoan(mockValidLoan)

      expect(result).toHaveProperty('id', 'loan-1')
      expect(result.amount).toBe(1000000)
      expect(result.status).toBe('ACTIVE')
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
    })
  })

  describe('updateLoan', () => {
    const mockExistingLoan: CreateLoanInput & { id: string } = {
      id: 'loan-1',
      facilityId: 'facility-1',
      amount: 1000000,
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

    it('should update loan with valid changes', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockExistingLoan)
      ;(prisma.loan.update as jest.Mock).mockImplementation((args) => Promise.resolve({ ...mockExistingLoan, ...args.data }))

      const updateData = {
        id: mockExistingLoan.id,
        amount: 800000,
        status: 'PARTIALLY_PAID' as const,
      }

      const result = await updateLoan(updateData)

      expect(result.amount).toBe(updateData.amount)
      expect(result.status).toBe(updateData.status)
      expect(consoleErrorSpy).not.toHaveBeenCalled()
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
    })
  })
}) 