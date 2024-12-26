import type { Prisma, PrismaClient } from '@prisma/client'
import { processPaydown } from '@/server/actions/loan/processPaydown'
import { addServicingActivity } from '@/server/actions/loan/addServicingActivity'
import { updateServicingActivity } from '@/server/actions/loan/updateServicingActivity'
import { prisma } from '@/server/db/client'

type MockPrisma = {
  [K in keyof PrismaClient]: {
    [M in keyof PrismaClient[K]]: jest.Mock;
  };
};

// Mock the prisma client
jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn((callback: (tx: MockPrisma) => Promise<any>) => callback(prisma as unknown as MockPrisma)),
    loan: {
      findUnique: jest.fn(),
    },
    facility: {
      findUnique: jest.fn(),
    },
    servicingActivity: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    transactionHistory: {
      create: jest.fn(),
    },
    loanPosition: {
      update: jest.fn(),
    },
    facilityPosition: {
      update: jest.fn(),
    },
  } as unknown as MockPrisma,
}))

describe('Servicing Activity Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('addServicingActivity', () => {
    it('should create a servicing activity', async () => {
      const mockActivity = {
        facilityId: 'facility-1',
        activityType: 'PRINCIPAL_PAYMENT',
        dueDate: new Date(),
        amount: 1000,
        status: 'PENDING',
      }

      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue({ id: 'facility-1' })
      ;(prisma.servicingActivity.create as jest.Mock).mockResolvedValue({ ...mockActivity, id: 'activity-1' })

      const result = await addServicingActivity(mockActivity)
      expect(result).toHaveProperty('id', 'activity-1')
      expect(prisma.servicingActivity.create).toHaveBeenCalledTimes(1)
    })

    it('should throw error if facility does not exist', async () => {
      const mockActivity = {
        facilityId: 'non-existent',
        activityType: 'PRINCIPAL_PAYMENT',
        dueDate: new Date(),
        amount: 1000,
        status: 'PENDING',
      }

      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(addServicingActivity(mockActivity)).rejects.toThrow('Facility with ID non-existent not found')
      expect(prisma.servicingActivity.create).not.toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      const invalidActivity = {
        facilityId: 'facility-1',
        // Missing required fields
      }

      await expect(addServicingActivity(invalidActivity as any)).rejects.toThrow()
      expect(prisma.servicingActivity.create).not.toHaveBeenCalled()
    })
  })

  describe('processPaydown', () => {
    const mockLoan = {
      id: 'loan-1',
      currency: 'USD',
      positions: [
        { id: 'pos-1', amount: 800, lenderId: 'lender-1' },
        { id: 'pos-2', amount: 200, lenderId: 'lender-2' }
      ],
      facility: {
        id: 'facility-1',
        positions: [
          { id: 'fpos-1', amount: 800 },
          { id: 'fpos-2', amount: 200 }
        ],
        creditAgreementId: 'ca-1',
      },
    }

    it('should process a paydown without creating duplicate servicing activity', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockLoan)
      ;(prisma.loanPosition.update as jest.Mock).mockImplementation((params: { where: { id: string } }) => {
        const position = mockLoan.positions.find(p => p.id === params.where.id)
        return Promise.resolve({ ...position, amount: position!.amount * 0.9 })
      })
      ;(prisma.facilityPosition.update as jest.Mock).mockImplementation((params: { where: { id: string } }) => {
        const position = mockLoan.facility.positions.find(p => p.id === params.where.id)
        return Promise.resolve({ ...position, amount: position!.amount * 1.1 })
      })
      ;(prisma.transactionHistory.create as jest.Mock).mockResolvedValue({ id: 'th-1' })

      const paydownParams = {
        loanId: 'loan-1',
        facilityId: 'facility-1',
        amount: 100,
        paymentDate: new Date(),
        servicingActivityId: 'existing-activity-1'
      }

      ;(prisma.servicingActivity.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-activity-1',
        status: 'COMPLETED',
        activityType: 'PRINCIPAL_PAYMENT',
        amount: 100,
        completedAt: new Date()
      })

      const result = await processPaydown(paydownParams)

      expect(result.success).toBe(true)
      expect(prisma.servicingActivity.create).not.toHaveBeenCalled()
      expect(prisma.servicingActivity.findUnique).toHaveBeenCalledWith({
        where: { id: 'existing-activity-1' }
      })
      expect(prisma.transactionHistory.create).toHaveBeenCalledTimes(1)
      expect(prisma.loanPosition.update).toHaveBeenCalledTimes(2)
      expect(prisma.facilityPosition.update).toHaveBeenCalledTimes(2)
    })

    it('should create new servicing activity if no existing activity provided', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockLoan)
      ;(prisma.loanPosition.update as jest.Mock).mockImplementation((params: { where: { id: string } }) => {
        const position = mockLoan.positions.find(p => p.id === params.where.id)
        return Promise.resolve({ ...position, amount: position!.amount * 0.9 })
      })
      ;(prisma.facilityPosition.update as jest.Mock).mockImplementation((params: { where: { id: string } }) => {
        const position = mockLoan.facility.positions.find(p => p.id === params.where.id)
        return Promise.resolve({ ...position, amount: position!.amount * 1.1 })
      })
      ;(prisma.servicingActivity.create as jest.Mock).mockResolvedValue({
        id: 'new-activity-1',
        status: 'COMPLETED',
        activityType: 'PRINCIPAL_PAYMENT',
        amount: 100,
        completedAt: new Date()
      })
      ;(prisma.transactionHistory.create as jest.Mock).mockResolvedValue({ id: 'th-1' })

      const result = await processPaydown({
        loanId: 'loan-1',
        facilityId: 'facility-1',
        amount: 100,
        paymentDate: new Date()
      })

      expect(result.success).toBe(true)
      expect(prisma.servicingActivity.create).toHaveBeenCalledTimes(1)
      expect(prisma.transactionHistory.create).toHaveBeenCalledTimes(1)
    })

    it('should throw error if paydown amount exceeds outstanding balance', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockLoan)

      await expect(processPaydown({
        loanId: 'loan-1',
        facilityId: 'facility-1',
        amount: 1100, // Total outstanding is 1000
        paymentDate: new Date()
      })).rejects.toThrow('Paydown amount 1100 exceeds outstanding balance 1000')

      expect(prisma.loanPosition.update).not.toHaveBeenCalled()
      expect(prisma.facilityPosition.update).not.toHaveBeenCalled()
      expect(prisma.servicingActivity.create).not.toHaveBeenCalled()
      expect(prisma.transactionHistory.create).not.toHaveBeenCalled()
    })
  })

  describe('updateServicingActivity', () => {
    it('should update activity status and process paydown when completed', async () => {
      const mockActivity = {
        id: 'activity-1',
        status: 'PENDING',
        activityType: 'PRINCIPAL_PAYMENT',
        facilityId: 'facility-1',
        amount: 1000,
      }

      ;(prisma.servicingActivity.findUnique as jest.Mock).mockResolvedValue(mockActivity)
      ;(prisma.servicingActivity.update as jest.Mock).mockResolvedValue({
        ...mockActivity,
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: 'test-user',
      })

      const result = await updateServicingActivity({
        id: 'activity-1',
        status: 'COMPLETED',
        completedBy: 'test-user',
      })

      expect(result.status).toBe('COMPLETED')
      expect(result.completedBy).toBe('test-user')
      expect(prisma.servicingActivity.update).toHaveBeenCalledTimes(1)
      expect(prisma.servicingActivity.update).toHaveBeenCalledWith({
        where: { id: 'activity-1' },
        data: {
          status: 'COMPLETED',
          completedAt: expect.any(Date),
          completedBy: 'test-user',
        }
      })
    })

    it('should throw error if activity does not exist', async () => {
      ;(prisma.servicingActivity.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(updateServicingActivity({
        id: 'non-existent',
        status: 'COMPLETED',
        completedBy: 'test-user',
      })).rejects.toThrow('Servicing activity with ID non-existent not found')

      expect(prisma.servicingActivity.update).not.toHaveBeenCalled()
    })

    it('should clear completion fields when status is not COMPLETED', async () => {
      const mockActivity = {
        id: 'activity-1',
        status: 'COMPLETED',
        activityType: 'PRINCIPAL_PAYMENT',
        facilityId: 'facility-1',
        amount: 1000,
        completedAt: new Date(),
        completedBy: 'test-user',
      }

      ;(prisma.servicingActivity.findUnique as jest.Mock).mockResolvedValue(mockActivity)
      ;(prisma.servicingActivity.update as jest.Mock).mockResolvedValue({
        ...mockActivity,
        status: 'PENDING',
        completedAt: null,
        completedBy: null,
      })

      const result = await updateServicingActivity({
        id: 'activity-1',
        status: 'PENDING',
      })

      expect(result.status).toBe('PENDING')
      expect(result.completedAt).toBeNull()
      expect(result.completedBy).toBeNull()
      expect(prisma.servicingActivity.update).toHaveBeenCalledWith({
        where: { id: 'activity-1' },
        data: {
          status: 'PENDING',
          completedAt: null,
          completedBy: null,
        }
      })
    })
  })
}) 