import { prisma } from '@/server/db/client'
import { createFacilityPosition } from '@/server/actions/loan/createFacilityPosition'
import { updateFacilityPosition } from '@/server/actions/loan/updateFacilityPosition'
import { type FacilityPositionInput } from '@/server/types/facility-position'

// Mock Prisma client
jest.mock('@/server/db/client', () => ({
  prisma: {
    facilityPosition: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    facility: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}))

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})

describe('Facility Position Management', () => {
  const mockFacility = {
    id: 'facility-1',
    facilityName: 'Term Loan A',
    facilityType: 'TERM_LOAN',
    commitmentAmount: 1000000,
    availableAmount: 1000000,
    currency: 'USD',
    startDate: new Date('2024-01-01'),
    maturityDate: new Date('2025-01-01'),
    interestType: 'FLOATING',
    baseRate: 'SOFR',
    margin: 2.5,
    description: 'Test facility',
    status: 'ACTIVE',
    creditAgreementId: 'ca-1',
    positions: [],
    loans: []
  }

  describe('Position Creation', () => {
    it('should create a facility position within available amount', async () => {
      const mockFacilityWithPositions = {
        ...mockFacility,
        positions: []
      }

      const positionData: FacilityPositionInput = {
        facilityId: mockFacility.id,
        lenderId: 'lender-1',
        amount: 500000,
        share: 50,
        status: 'ACTIVE',
      }

      const mockCreatedPosition = {
        id: 'position-1',
        ...positionData,
      }

      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(mockFacilityWithPositions)
      ;(prisma.facilityPosition.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.facilityPosition.create as jest.Mock).mockResolvedValue(mockCreatedPosition)

      const position = await createFacilityPosition(positionData)
      expect(position).toBeDefined()
      expect(position.amount).toBe(positionData.amount)
      expect(position.share).toBe(positionData.share)
      expect(prisma.facilityPosition.create).toHaveBeenCalledWith({
        data: expect.objectContaining(positionData),
      })
    })

    it('should reject position exceeding facility available amount', async () => {
      const mockFacilityWithPositions = {
        ...mockFacility,
        positions: []
      }

      const positionData: FacilityPositionInput = {
        facilityId: mockFacility.id,
        lenderId: 'lender-1',
        amount: 1500000, // Exceeds available amount
        share: 100,
        status: 'ACTIVE',
      }

      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(mockFacilityWithPositions)
      ;(prisma.facilityPosition.findMany as jest.Mock).mockResolvedValue([])

      await expect(createFacilityPosition(positionData))
        .rejects.toThrow('Total positions would exceed facility commitment')

      expect(prisma.facilityPosition.create).not.toHaveBeenCalled()
    })

    it('should validate total positions do not exceed facility commitment', async () => {
      const existingPosition = {
        id: 'position-1',
        facilityId: mockFacility.id,
        lenderId: 'lender-1',
        amount: 800000,
        share: 80,
        status: 'ACTIVE',
      }

      const mockFacilityWithPositions = {
        ...mockFacility,
        positions: [existingPosition]
      }

      const positionData: FacilityPositionInput = {
        facilityId: mockFacility.id,
        lenderId: 'lender-1',
        amount: 300000,
        share: 30, // Would exceed 100% with existing position
        status: 'ACTIVE',
      }

      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(mockFacilityWithPositions)
      ;(prisma.facilityPosition.findMany as jest.Mock).mockResolvedValue([existingPosition])

      await expect(createFacilityPosition(positionData))
        .rejects.toThrow('Total position shares would exceed 100%')

      expect(prisma.facilityPosition.create).not.toHaveBeenCalled()
    })

    it('should validate position amount covers pro-rata share of loans', async () => {
      const mockFacilityWithLoans = {
        ...mockFacility,
        positions: [],
        loans: [{
          id: 'loan-1',
          amount: 500000,
          outstandingAmount: 500000,
          status: 'ACTIVE'
        }]
      }

      const positionData: FacilityPositionInput = {
        facilityId: mockFacility.id,
        lenderId: 'lender-1',
        amount: 200000, // Less than required for 50% share of 500000
        share: 50,
        status: 'ACTIVE',
      }

      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(mockFacilityWithLoans)
      ;(prisma.facilityPosition.findMany as jest.Mock).mockResolvedValue([])

      await expect(createFacilityPosition(positionData))
        .rejects.toThrow('Position amount must cover pro-rata share of outstanding loans')

      expect(prisma.facilityPosition.create).not.toHaveBeenCalled()
    })
  })

  describe('Position Updates', () => {
    it('should update position amount within available limits', async () => {
      const existingPosition = {
        id: 'position-1',
        facilityId: mockFacility.id,
        lenderId: 'lender-1',
        amount: 500000,
        share: 50,
        status: 'ACTIVE',
      }

      const mockFacilityWithPositions = {
        ...mockFacility,
        positions: [existingPosition],
        loans: []
      }

      const updateData = {
        id: existingPosition.id,
        amount: 600000,
        share: 60,
      }

      ;(prisma.facilityPosition.findUnique as jest.Mock).mockResolvedValue({
        ...existingPosition,
        facility: mockFacilityWithPositions
      })
      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(mockFacilityWithPositions)
      ;(prisma.facilityPosition.findMany as jest.Mock).mockResolvedValue([existingPosition])
      ;(prisma.facilityPosition.update as jest.Mock).mockResolvedValue({
        ...existingPosition,
        ...updateData,
      })

      const result = await updateFacilityPosition(updateData)
      expect(result).toBeDefined()
      expect(result.amount).toBe(updateData.amount)
      expect(result.share).toBe(updateData.share)
      expect(prisma.facilityPosition.update).toHaveBeenCalledWith({
        where: { id: updateData.id },
        data: {
          amount: updateData.amount,
          share: updateData.share,
        },
      })
    })

    it('should reject updates that would exceed facility commitment', async () => {
      const existingPosition = {
        id: 'position-1',
        facilityId: mockFacility.id,
        lenderId: 'lender-1',
        amount: 500000,
        share: 50,
        status: 'ACTIVE',
      }

      const mockFacilityWithPositions = {
        ...mockFacility,
        positions: [existingPosition]
      }

      const updateData = {
        id: existingPosition.id,
        amount: 1200000, // Would exceed facility commitment
        share: 50,
      }

      ;(prisma.facilityPosition.findUnique as jest.Mock).mockResolvedValue({
        ...existingPosition,
        facility: mockFacilityWithPositions
      })
      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(mockFacilityWithPositions)
      ;(prisma.facilityPosition.findMany as jest.Mock).mockResolvedValue([existingPosition])

      await expect(updateFacilityPosition(updateData))
        .rejects.toThrow('Total positions would exceed facility commitment')

      expect(prisma.facilityPosition.update).not.toHaveBeenCalled()
    })

    it('should validate position status transitions', async () => {
      const existingPosition = {
        id: 'position-1',
        facilityId: mockFacility.id,
        lenderId: 'lender-1',
        amount: 500000,
        share: 50,
        status: 'COMPLETED',
      }

      const updateData = {
        id: existingPosition.id,
        status: 'ACTIVE' as const,
      }

      ;(prisma.facilityPosition.findUnique as jest.Mock).mockResolvedValue({
        ...existingPosition,
        facility: {
          ...mockFacility,
          positions: [existingPosition],
          loans: []
        }
      })

      await expect(updateFacilityPosition(updateData))
        .rejects.toThrow('Cannot reactivate completed position')

      expect(prisma.facilityPosition.update).not.toHaveBeenCalled()
    })

    it('should validate total shares do not exceed 100%', async () => {
      const existingPosition = {
        id: 'position-1',
        facilityId: mockFacility.id,
        lenderId: 'lender-1',
        amount: 500000,
        share: 50,
        status: 'ACTIVE',
      }

      const otherPosition = {
        id: 'position-2',
        facilityId: mockFacility.id,
        lenderId: 'lender-2',
        amount: 300000,
        share: 30,
        status: 'ACTIVE',
      }

      const mockFacilityWithPositions = {
        ...mockFacility,
        positions: [existingPosition, otherPosition]
      }

      const updateData = {
        id: existingPosition.id,
        share: 80, // Would exceed 100% with other position's 30%
      }

      ;(prisma.facilityPosition.findUnique as jest.Mock).mockResolvedValue({
        ...existingPosition,
        facility: mockFacilityWithPositions
      })

      await expect(updateFacilityPosition(updateData))
        .rejects.toThrow('Total position shares would exceed 100%')

      expect(prisma.facilityPosition.update).not.toHaveBeenCalled()
    })
  })
}) 