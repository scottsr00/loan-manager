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
    $transaction: jest.fn((callback) => callback({
      loan: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      facilityPosition: {
        update: jest.fn(),
      },
      servicingActivity: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      transactionHistory: {
        create: jest.fn(),
      },
      facility: {
        findUnique: jest.fn(),
      },
    })),
    servicingActivity: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    loan: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    facilityPosition: {
      update: jest.fn(),
    },
    transactionHistory: {
      create: jest.fn(),
    },
    facility: {
      findUnique: jest.fn(),
    },
  },
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
        amount: 1000,
        dueDate: new Date(),
        description: 'Test payment',
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
      const mockLoan = {
        id: 'loan-1',
        outstandingAmount: 1000,
        currency: 'USD',
        facility: {
          id: 'facility-1',
          positions: [
            { id: 'pos-1', lenderId: 'lender-1', amount: 600 },
            { id: 'pos-2', lenderId: 'lender-2', amount: 400 },
          ],
          creditAgreement: {
            id: 'ca-1'
          }
        }
      }

      const mockServicingActivity = {
        id: 'sa-1',
        activityType: 'PRINCIPAL_PAYMENT',
        amount: 500,
        status: 'COMPLETED',
        completedAt: new Date(),
      }

      const mockFacilityPositionUpdate = jest.fn().mockResolvedValue({})
      const mockLoanUpdate = jest.fn().mockResolvedValue({
        ...mockLoan,
        outstandingAmount: 500
      })

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) => {
        return callback({
          loan: {
            findUnique: jest.fn().mockResolvedValue(mockLoan),
            update: mockLoanUpdate,
          },
          facilityPosition: {
            update: mockFacilityPositionUpdate,
          },
          servicingActivity: {
            findUnique: jest.fn().mockResolvedValue(mockServicingActivity),
            create: jest.fn(),
          },
          transactionHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        })
      })

      const result = await processPaydown({
        loanId: 'loan-1',
        facilityId: 'facility-1',
        amount: 500,
        paymentDate: new Date(),
        servicingActivityId: 'sa-1'
      })

      expect(result.success).toBe(true)
      expect(result.loan.previousOutstandingAmount).toBe(1000)
      expect(result.loan.newOutstandingAmount).toBe(500)
      expect(mockFacilityPositionUpdate).toHaveBeenCalledTimes(2)
      expect(mockFacilityPositionUpdate).toHaveBeenCalledWith({
        where: { id: 'pos-1' },
        data: { amount: expect.any(Number) }
      })
      expect(mockFacilityPositionUpdate).toHaveBeenCalledWith({
        where: { id: 'pos-2' },
        data: { amount: expect.any(Number) }
      })
    })

    it('should create new servicing activity if no existing activity provided', async () => {
      const mockLoan = {
        id: 'loan-1',
        outstandingAmount: 1000,
        currency: 'USD',
        facility: {
          id: 'facility-1',
          positions: [
            { id: 'pos-1', lenderId: 'lender-1', amount: 600 },
            { id: 'pos-2', lenderId: 'lender-2', amount: 400 },
          ],
          creditAgreement: {
            id: 'ca-1'
          }
        }
      }

      const mockNewServicingActivity = {
        id: 'sa-2',
        activityType: 'PRINCIPAL_PAYMENT',
        amount: 500,
        status: 'COMPLETED',
        completedAt: new Date(),
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) => {
        return callback({
          loan: {
            findUnique: jest.fn().mockResolvedValue(mockLoan),
            update: jest.fn().mockResolvedValue({
              ...mockLoan,
              outstandingAmount: 500
            }),
          },
          facilityPosition: {
            update: jest.fn().mockResolvedValue({}),
          },
          servicingActivity: {
            create: jest.fn().mockResolvedValue(mockNewServicingActivity),
            findUnique: jest.fn(),
          },
          transactionHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        })
      })

      const result = await processPaydown({
        loanId: 'loan-1',
        facilityId: 'facility-1',
        amount: 500,
        paymentDate: new Date(),
      })

      expect(result.success).toBe(true)
      expect(result.loan.previousOutstandingAmount).toBe(1000)
      expect(result.loan.newOutstandingAmount).toBe(500)
      expect(result.servicingActivity.id).toBe('sa-2')
    })

    it('should throw error if paydown amount exceeds outstanding balance', async () => {
      const mockLoan = {
        id: 'loan-1',
        outstandingAmount: 1000,
        currency: 'USD',
        facility: {
          id: 'facility-1',
          positions: [
            { id: 'pos-1', lenderId: 'lender-1', amount: 600 },
            { id: 'pos-2', lenderId: 'lender-2', amount: 400 },
          ],
          creditAgreement: {
            id: 'ca-1'
          }
        }
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) => {
        return callback({
          loan: {
            findUnique: jest.fn().mockResolvedValue(mockLoan),
            update: jest.fn(),
          },
          facilityPosition: {
            update: jest.fn(),
          },
          servicingActivity: {
            create: jest.fn(),
            findUnique: jest.fn(),
          },
          transactionHistory: {
            create: jest.fn(),
          },
        })
      })

      await expect(processPaydown({
        loanId: 'loan-1',
        facilityId: 'facility-1',
        amount: 1100, // Total outstanding is 1000
        paymentDate: new Date()
      })).rejects.toThrow('Paydown amount 1100 exceeds outstanding balance 1000')

      expect(prisma.facilityPosition.update).not.toHaveBeenCalled()
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