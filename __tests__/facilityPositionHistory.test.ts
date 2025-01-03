import { prisma } from '@/lib/prisma'
import { createFacilityPositionHistory, getFacilityPositionHistory } from '@/server/actions/facility/facilityPositionHistory'
import { PositionChangeType } from '@prisma/client'
import { FacilityPositionStatus } from '@/server/types/facility-position'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    facilityPositionHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn()
    },
    facility: {
      findUnique: jest.fn()
    }
  }
}))

describe('Facility Position History', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createFacilityPositionHistory', () => {
    const mockInput = {
      facilityId: 'facility-1',
      lenderId: 'lender-1',
      changeType: PositionChangeType.TRADE,
      previousCommitmentAmount: 1000000,
      newCommitmentAmount: 800000,
      previousUndrawnAmount: 500000,
      newUndrawnAmount: 400000,
      previousDrawnAmount: 500000,
      newDrawnAmount: 400000,
      previousShare: 50,
      newShare: 40,
      previousStatus: FacilityPositionStatus.ACTIVE,
      newStatus: FacilityPositionStatus.ACTIVE,
      changeAmount: -200000,
      userId: 'user-1',
      notes: 'Test trade position update'
    }

    const mockHistoryRecord = {
      id: 'history-1',
      ...mockInput,
      changeDateTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      facility: {
        facilityName: 'Test Facility',
        currency: 'USD',
        commitmentAmount: 2000000
      },
      lender: {
        entityId: 'lender-1'
      }
    }

    it('should create a facility position history record', async () => {
      ;(prisma.facilityPositionHistory.create as jest.Mock).mockResolvedValue(mockHistoryRecord)

      const result = await createFacilityPositionHistory(mockInput)

      expect(prisma.facilityPositionHistory.create).toHaveBeenCalledWith({
        data: {
          ...mockInput,
          changeDateTime: expect.any(Date)
        },
        include: {
          facility: {
            select: {
              facilityName: true,
              currency: true,
              commitmentAmount: true
            }
          },
          lender: true
        }
      })

      expect(result).toEqual(mockHistoryRecord)
    })

    it('should throw an error if creation fails', async () => {
      const error = new Error('Failed to create history record')
      ;(prisma.facilityPositionHistory.create as jest.Mock).mockRejectedValue(error)

      await expect(createFacilityPositionHistory(mockInput)).rejects.toThrow('Failed to create facility position history record')
    })
  })

  describe('getFacilityPositionHistory', () => {
    const mockHistoryRecords = [
      {
        id: 'history-1',
        facilityId: 'facility-1',
        lenderId: 'lender-1',
        changeDateTime: new Date(),
        changeType: PositionChangeType.TRADE,
        previousCommitmentAmount: 1000000,
        newCommitmentAmount: 800000,
        previousUndrawnAmount: 500000,
        newUndrawnAmount: 400000,
        previousDrawnAmount: 500000,
        newDrawnAmount: 400000,
        previousShare: 50,
        newShare: 40,
        previousStatus: FacilityPositionStatus.ACTIVE,
        newStatus: FacilityPositionStatus.ACTIVE,
        changeAmount: -200000,
        userId: 'user-1',
        notes: 'Test trade position update',
        createdAt: new Date(),
        updatedAt: new Date(),
        facility: {
          facilityName: 'Test Facility',
          currency: 'USD',
          commitmentAmount: 2000000
        },
        lender: {
          entityId: 'lender-1'
        }
      }
    ]

    it('should retrieve facility position history records', async () => {
      ;(prisma.facilityPositionHistory.findMany as jest.Mock).mockResolvedValue(mockHistoryRecords)

      const result = await getFacilityPositionHistory({ facilityId: 'facility-1' })

      expect(prisma.facilityPositionHistory.findMany).toHaveBeenCalledWith({
        where: {
          facilityId: 'facility-1'
        },
        include: {
          facility: true,
          lender: true,
          servicingActivity: true,
          trade: {
            include: {
              sellerCounterparty: true
            }
          }
        },
        orderBy: {
          changeDateTime: 'desc'
        }
      })

      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'history-1',
          facilityName: 'Test Facility',
          lenderName: 'lender-1',
          changeType: PositionChangeType.TRADE,
          previousAmount: 1000000,
          newAmount: 800000,
          previousShare: 50,
          newShare: 40,
          changeAmount: -200000
        })
      ]))
    })

    it('should throw an error if facilityId is not provided', async () => {
      await expect(getFacilityPositionHistory({})).rejects.toThrow('Facility ID is required')
    })

    it('should filter by date range when provided', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      ;(prisma.facilityPositionHistory.findMany as jest.Mock).mockResolvedValue(mockHistoryRecords)

      await getFacilityPositionHistory({
        facilityId: 'facility-1',
        startDate,
        endDate
      })

      expect(prisma.facilityPositionHistory.findMany).toHaveBeenCalledWith({
        where: {
          facilityId: 'facility-1',
          changeDateTime: {
            gte: startDate,
            lte: endDate
          }
        },
        include: expect.any(Object),
        orderBy: expect.any(Object)
      })
    })

    it('should filter by activity when provided', async () => {
      ;(prisma.facilityPositionHistory.findMany as jest.Mock).mockResolvedValue(mockHistoryRecords)

      await getFacilityPositionHistory({
        facilityId: 'facility-1',
        activityId: 'activity-1',
        activityType: 'SERVICING'
      })

      expect(prisma.facilityPositionHistory.findMany).toHaveBeenCalledWith({
        where: {
          facilityId: 'facility-1',
          servicingActivityId: 'activity-1'
        },
        include: expect.any(Object),
        orderBy: expect.any(Object)
      })
    })

    it('should throw an error if retrieval fails', async () => {
      const error = new Error('Database error')
      ;(prisma.facilityPositionHistory.findMany as jest.Mock).mockRejectedValue(error)

      await expect(getFacilityPositionHistory({ facilityId: 'facility-1' })).rejects.toThrow('Failed to fetch facility position history')
    })
  })
}) 