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
    loan: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
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
    const mockLoan: CreateLoanInput = {
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

    it('should create a loan with valid inputs', async () => {
      const mockCreatedLoan = {
        id: 'loan-1',
        ...mockLoan,
        createdAt: new Date(),
        updatedAt: new Date(),
        positions: [
          {
            id: 'pos-1',
            loanId: 'loan-1',
            ...mockLoan.positions[0],
          },
        ],
        facility: {
          id: 'facility-1',
          facilityName: 'Test Facility',
        },
      }

      ;(prisma.loan.create as jest.Mock).mockResolvedValue(mockCreatedLoan)

      const result = await createLoan(mockLoan)

      expect(result).toHaveProperty('id', 'loan-1')
      expect(result.amount).toBe(mockLoan.amount)
      expect(prisma.loan.create).toHaveBeenCalledTimes(1)
      expect(prisma.loan.create).toHaveBeenCalledWith({
        data: {
          facilityId: mockLoan.facilityId,
          amount: mockLoan.amount,
          outstandingAmount: mockLoan.amount,
          currency: mockLoan.currency,
          status: mockLoan.status,
          positions: {
            create: mockLoan.positions.map((position: LoanPosition) => ({
              lenderId: position.lenderId,
              amount: position.amount,
              status: position.status,
            })),
          },
        },
        include: {
          positions: true,
          facility: true,
        },
      })
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      const invalidLoan = {
        facilityId: '',
        amount: 0,
        currency: 'USD',
        status: 'ACTIVE',
        positions: [],
      } as CreateLoanInput

      await expect(createLoan(invalidLoan))
        .rejects.toThrow(/Facility ID is required|Amount must be positive|At least one position is required/)

      expect(prisma.loan.create).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating loan:',
        expect.any(Error)
      )
    })

    it('should validate position amounts match loan amount', async () => {
      const invalidLoan: CreateLoanInput = {
        facilityId: 'facility-1',
        amount: 1000000,
        currency: 'USD',
        status: 'ACTIVE',
        positions: [
          {
            lenderId: 'lender-1',
            amount: 900000,
            status: 'ACTIVE',
          },
        ],
      }

      await expect(createLoan(invalidLoan))
        .rejects.toThrow('Position amounts must equal loan amount')

      expect(prisma.loan.create).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating loan:',
        expect.any(Error)
      )
    })

    it('should validate positive amounts', async () => {
      const invalidLoan: CreateLoanInput = {
        facilityId: 'facility-1',
        amount: -1000,
        currency: 'USD',
        status: 'ACTIVE',
        positions: [
          {
            lenderId: 'lender-1',
            amount: -1000,
            status: 'ACTIVE',
          },
        ],
      }

      await expect(createLoan(invalidLoan))
        .rejects.toThrow(/Amount must be positive|Position amount must be positive/)

      expect(prisma.loan.create).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating loan:',
        expect.any(Error)
      )
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