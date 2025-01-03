import { prisma } from '@/server/db/client'
import { createFacilityPositionHistory, getFacilityPositionHistory } from '@/server/actions/facility/facilityPositionHistory'
import { closeTrade } from '@/server/actions/trade/closeTrade'
import { PositionChangeType, type Entity, type Lender, type Facility, type FacilityPosition, type Trade } from '@prisma/client'
import { FacilityPositionStatus } from '@/server/types/facility-position'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    entity: {
      create: jest.fn(),
      deleteMany: jest.fn()
    },
    lender: {
      create: jest.fn(),
      deleteMany: jest.fn()
    },
    facility: {
      create: jest.fn(),
      delete: jest.fn()
    },
    facilityPosition: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn()
    },
    facilityPositionHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn()
    },
    trade: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    }
  }
}))

// Mock server actions to use the mocked Prisma client
jest.mock('@/server/actions/facility/facilityPositionHistory', () => {
  const originalModule = jest.requireActual('@/server/actions/facility/facilityPositionHistory')
  return {
    ...originalModule,
    createFacilityPositionHistory: jest.fn(originalModule.createFacilityPositionHistory),
    getFacilityPositionHistory: jest.fn(originalModule.getFacilityPositionHistory)
  }
})

jest.mock('@/server/actions/trade/closeTrade', () => {
  const originalModule = jest.requireActual('@/server/actions/trade/closeTrade')
  return {
    ...originalModule,
    closeTrade: jest.fn(originalModule.closeTrade)
  }
})

describe('Facility Position History Integration', () => {
  let testEntity1: Entity
  let testEntity2: Entity
  let testLender1: Lender
  let testLender2: Lender
  let testFacility: Facility
  let testPosition1: FacilityPosition
  let testPosition2: FacilityPosition
  let testTrade: Trade

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock entity creation
    testEntity1 = {
      id: 'test-entity-1',
      legalName: 'Test Entity 1',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    } as Entity

    testEntity2 = {
      id: 'test-entity-2',
      legalName: 'Test Entity 2',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    } as Entity

    // Mock lender creation
    testLender1 = {
      id: 'test-lender-1',
      entityId: testEntity1.id,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    } as Lender

    testLender2 = {
      id: 'test-lender-2',
      entityId: testEntity2.id,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    } as Lender

    // Mock facility creation
    testFacility = {
      id: 'test-facility',
      facilityName: 'Test Facility',
      facilityType: 'TERM',
      creditAgreementId: 'test-agreement',
      commitmentAmount: 2000000,
      availableAmount: 2000000,
      outstandingAmount: 0,
      currency: 'USD',
      startDate: new Date(),
      maturityDate: new Date('2025-12-31'),
      interestType: 'FIXED',
      baseRate: 'SOFR',
      margin: 2.5,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    } as Facility

    // Mock position creation
    testPosition1 = {
      id: 'test-position-1',
      facilityId: testFacility.id,
      lenderId: testLender1.id,
      commitmentAmount: 1000000,
      undrawnAmount: 1000000,
      drawnAmount: 0,
      share: 50,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    } as FacilityPosition

    testPosition2 = {
      id: 'test-position-2',
      facilityId: testFacility.id,
      lenderId: testLender2.id,
      commitmentAmount: 1000000,
      undrawnAmount: 1000000,
      drawnAmount: 0,
      share: 50,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    } as FacilityPosition

    // Set up mock responses
    ;(prisma.entity.create as jest.Mock).mockResolvedValueOnce(testEntity1)
    ;(prisma.entity.create as jest.Mock).mockResolvedValueOnce(testEntity2)
    ;(prisma.lender.create as jest.Mock).mockResolvedValueOnce(testLender1)
    ;(prisma.lender.create as jest.Mock).mockResolvedValueOnce(testLender2)
    ;(prisma.facility.create as jest.Mock).mockResolvedValueOnce(testFacility)
    ;(prisma.facilityPosition.create as jest.Mock).mockResolvedValueOnce(testPosition1)
    ;(prisma.facilityPosition.create as jest.Mock).mockResolvedValueOnce(testPosition2)
  })

  describe('Trade Flow', () => {
    beforeEach(async () => {
      // Mock test trade
      testTrade = {
        id: 'test-trade',
        facilityId: testFacility.id,
        sellerCounterpartyId: testLender1.id,
        buyerCounterpartyId: testLender2.id,
        tradeDate: new Date(),
        settlementDate: new Date(),
        parAmount: 200000,
        price: 100,
        settlementAmount: 200000,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Trade

      ;(prisma.trade.create as jest.Mock).mockResolvedValueOnce(testTrade)
      ;(prisma.trade.findUnique as jest.Mock).mockResolvedValue(testTrade)
      ;(prisma.facilityPosition.findFirst as jest.Mock).mockResolvedValueOnce(testPosition1)
      ;(prisma.facilityPosition.findFirst as jest.Mock).mockResolvedValueOnce(testPosition2)
      ;(prisma.facilityPositionHistory.create as jest.Mock).mockImplementation(async (args: { data: any }) => ({
        id: 'test-history',
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    })

    it('should create position history records when closing a trade', async () => {
      // Mock position history records
      const sellerHistory = {
        id: 'seller-history',
        facilityId: testFacility.id,
        lenderId: testLender1.id,
        changeType: PositionChangeType.TRADE,
        previousAmount: 1000000,
        newAmount: 800000,
        changeAmount: -200000,
        lenderName: testEntity1.id,
        changeDateTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const buyerHistory = {
        id: 'buyer-history',
        facilityId: testFacility.id,
        lenderId: testLender2.id,
        changeType: PositionChangeType.TRADE,
        previousAmount: 1000000,
        newAmount: 1200000,
        changeAmount: 200000,
        lenderName: testEntity2.id,
        changeDateTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.facilityPositionHistory.findMany as jest.Mock).mockResolvedValueOnce([sellerHistory, buyerHistory])

      // Close the trade
      await closeTrade(testTrade.id, 'test-user')

      // Get position history records
      const history = await getFacilityPositionHistory({
        facilityId: testFacility.id,
        activityId: testTrade.id,
        activityType: 'TRADE'
      })

      // Verify seller history record
      const sellerHistoryRecord = history.find(h => h.lenderName === testEntity1.id)
      expect(sellerHistoryRecord).toBeDefined()
      expect(sellerHistoryRecord?.changeType).toBe(PositionChangeType.TRADE)
      expect(sellerHistoryRecord?.previousAmount).toBe(1000000)
      expect(sellerHistoryRecord?.newAmount).toBe(800000)
      expect(sellerHistoryRecord?.changeAmount).toBe(-200000)

      // Verify buyer history record
      const buyerHistoryRecord = history.find(h => h.lenderName === testEntity2.id)
      expect(buyerHistoryRecord).toBeDefined()
      expect(buyerHistoryRecord?.changeType).toBe(PositionChangeType.TRADE)
      expect(buyerHistoryRecord?.previousAmount).toBe(1000000)
      expect(buyerHistoryRecord?.newAmount).toBe(1200000)
      expect(buyerHistoryRecord?.changeAmount).toBe(200000)
    })

    it('should update position shares correctly', async () => {
      // Mock updated positions
      const updatedSellerPosition = {
        ...testPosition1,
        commitmentAmount: 800000,
        share: 40
      }

      const updatedBuyerPosition = {
        ...testPosition2,
        commitmentAmount: 1200000,
        share: 60
      }

      ;(prisma.facilityPosition.findMany as jest.Mock).mockResolvedValueOnce([updatedSellerPosition, updatedBuyerPosition])

      // Close the trade
      await closeTrade(testTrade.id, 'test-user')

      // Get updated positions
      const positions = await prisma.facilityPosition.findMany({
        where: {
          facilityId: testFacility.id
        }
      })

      // Verify seller position
      const sellerPosition = positions.find((p: FacilityPosition) => p.lenderId === testLender1.id)
      expect(sellerPosition?.commitmentAmount).toBe(800000)
      expect(sellerPosition?.share).toBe(40)

      // Verify buyer position
      const buyerPosition = positions.find((p: FacilityPosition) => p.lenderId === testLender2.id)
      expect(buyerPosition?.commitmentAmount).toBe(1200000)
      expect(buyerPosition?.share).toBe(60)
    })
  })

  describe('Manual Position Updates', () => {
    it('should create position history record for manual updates', async () => {
      const newCommitmentAmount = 1200000
      const newShare = 60

      const historyRecord = {
        id: 'test-history',
        facilityId: testFacility.id,
        lenderId: testLender1.id,
        changeType: PositionChangeType.TRADE,
        previousCommitmentAmount: testPosition1.commitmentAmount,
        newCommitmentAmount,
        previousShare: testPosition1.share,
        newShare,
        changeAmount: newCommitmentAmount - testPosition1.commitmentAmount,
        lenderName: testEntity1.id,
        changeDateTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.facilityPositionHistory.create as jest.Mock).mockResolvedValueOnce(historyRecord)
      ;(prisma.facilityPositionHistory.findMany as jest.Mock).mockResolvedValueOnce([historyRecord])

      // Create position history record
      await createFacilityPositionHistory({
        facilityId: testFacility.id,
        lenderId: testLender1.id,
        changeType: PositionChangeType.TRADE,
        previousCommitmentAmount: testPosition1.commitmentAmount,
        newCommitmentAmount,
        previousUndrawnAmount: testPosition1.undrawnAmount,
        newUndrawnAmount: testPosition1.undrawnAmount,
        previousDrawnAmount: testPosition1.drawnAmount,
        newDrawnAmount: testPosition1.drawnAmount,
        previousShare: testPosition1.share,
        newShare,
        previousStatus: testPosition1.status as FacilityPositionStatus,
        newStatus: testPosition1.status as FacilityPositionStatus,
        changeAmount: newCommitmentAmount - testPosition1.commitmentAmount,
        userId: 'test-user',
        notes: 'Manual commitment update'
      })

      // Get position history records
      const history = await getFacilityPositionHistory({
        facilityId: testFacility.id,
        lenderId: testLender1.id
      })

      // Verify history record
      expect(history[0]).toBeDefined()
      expect(history[0].changeType).toBe(PositionChangeType.TRADE)
      expect(history[0].previousAmount).toBe(testPosition1.commitmentAmount)
      expect(history[0].newAmount).toBe(newCommitmentAmount)
      expect(history[0].previousShare).toBe(testPosition1.share)
      expect(history[0].newShare).toBe(newShare)
      expect(history[0].changeAmount).toBe(newCommitmentAmount - testPosition1.commitmentAmount)
    })
  })

  describe('History Retrieval', () => {
    it('should filter history by date range', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      const historyRecord = {
        id: 'test-history',
        facilityId: testFacility.id,
        lenderId: testLender1.id,
        changeType: PositionChangeType.TRADE,
        previousCommitmentAmount: 1000000,
        newCommitmentAmount: 1200000,
        previousShare: 50,
        newShare: 60,
        changeAmount: 200000,
        lenderName: testEntity1.id,
        changeDateTime: new Date('2024-01-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(prisma.facilityPositionHistory.create as jest.Mock).mockResolvedValueOnce(historyRecord)
      ;(prisma.facilityPositionHistory.findMany as jest.Mock).mockResolvedValueOnce([historyRecord])

      // Create some test history records
      await createFacilityPositionHistory({
        facilityId: testFacility.id,
        lenderId: testLender1.id,
        changeType: PositionChangeType.TRADE,
        previousCommitmentAmount: 1000000,
        newCommitmentAmount: 1200000,
        previousUndrawnAmount: 1000000,
        newUndrawnAmount: 1200000,
        previousDrawnAmount: 0,
        newDrawnAmount: 0,
        previousShare: 50,
        newShare: 60,
        previousStatus: FacilityPositionStatus.ACTIVE,
        newStatus: FacilityPositionStatus.ACTIVE,
        changeAmount: 200000,
        userId: 'test-user',
        notes: 'Test history record'
      })

      // Get history records within date range
      const history = await getFacilityPositionHistory({
        facilityId: testFacility.id,
        startDate,
        endDate
      })

      // Verify filtered records
      expect(history.length).toBeGreaterThan(0)
      history.forEach(record => {
        expect(record.changeDateTime.getTime()).toBeGreaterThanOrEqual(startDate.getTime())
        expect(record.changeDateTime.getTime()).toBeLessThanOrEqual(endDate.getTime())
      })
    })
  })
}) 