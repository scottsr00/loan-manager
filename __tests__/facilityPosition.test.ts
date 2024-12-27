import { prisma } from '@/server/db/client'
import { createFacilityPosition } from '@/server/actions/loan/createFacilityPosition'
import { updateFacilityPosition } from '@/server/actions/loan/updateFacilityPosition'
import { type FacilityPositionInput } from '@/server/types/facility-position'

describe('Facility Position Management', () => {
  let testFacility: any
  let testLender: any
  let testEntity: any
  let testCreditAgreement: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock test entity
    testEntity = {
      id: 'test-entity-1',
      legalName: 'Test Corp',
      status: 'ACTIVE'
    }
    ;(prisma.entity.create as jest.Mock).mockResolvedValue(testEntity)

    // Mock test lender
    testLender = {
      id: 'test-lender-1',
      entityId: testEntity.id,
      status: 'ACTIVE'
    }
    ;(prisma.lender.create as jest.Mock).mockResolvedValue(testLender)

    // Mock test credit agreement
    testCreditAgreement = {
      id: 'test-ca-1',
      amount: 1000000,
      currency: 'USD',
      status: 'ACTIVE'
    }

    // Mock test facility
    testFacility = {
      id: 'test-facility-1',
      facilityName: 'Test Facility',
      facilityType: 'TERM_LOAN',
      creditAgreementId: testCreditAgreement.id,
      commitmentAmount: 500000,
      availableAmount: 500000,
      currency: 'USD',
      status: 'ACTIVE',
      positions: [],
      creditAgreement: testCreditAgreement
    }
    ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(testFacility)
  })

  describe('Position Creation', () => {
    it('should create a facility position within available amount', async () => {
      const positionData: FacilityPositionInput = {
        facilityId: testFacility.id,
        lenderId: testLender.id,
        amount: 200000,
        status: 'ACTIVE'
      }

      const mockCreatedPosition = {
        id: 'test-position-1',
        ...positionData
      }
      ;(prisma.facilityPosition.create as jest.Mock).mockResolvedValue(mockCreatedPosition)

      const position = await createFacilityPosition(positionData)
      expect(position).toBeDefined()
      expect(position.amount).toBeLessThanOrEqual(testFacility.availableAmount)
      expect(position.facilityId).toBe(testFacility.id)
      expect(position.lenderId).toBe(testLender.id)
      expect(prisma.facilityPosition.create).toHaveBeenCalledWith({ data: positionData })
    })

    it('should reject position exceeding facility available amount', async () => {
      const positionData: FacilityPositionInput = {
        facilityId: testFacility.id,
        lenderId: testLender.id,
        amount: 600000, // Exceeds available amount
        status: 'ACTIVE'
      }

      await expect(createFacilityPosition(positionData)).rejects.toThrow('Position amount exceeds facility available amount')
      expect(prisma.facilityPosition.create).not.toHaveBeenCalled()
    })

    it('should validate total positions do not exceed facility commitment', async () => {
      // Mock existing position
      testFacility.positions = [{
        id: 'test-position-1',
        amount: 300000,
        status: 'ACTIVE'
      }]
      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(testFacility)

      const positionData: FacilityPositionInput = {
        facilityId: testFacility.id,
        lenderId: testLender.id,
        amount: 300000,
        status: 'ACTIVE'
      }

      await expect(createFacilityPosition(positionData)).rejects.toThrow('Total positions would exceed facility commitment')
      expect(prisma.facilityPosition.create).not.toHaveBeenCalled()
    })
  })

  describe('Position Updates', () => {
    it('should update position amount within available limits', async () => {
      const existingPosition = {
        id: 'test-position-1',
        facilityId: testFacility.id,
        lenderId: testLender.id,
        amount: 200000,
        status: 'ACTIVE'
      }
      ;(prisma.facilityPosition.findUnique as jest.Mock).mockResolvedValue(existingPosition)

      const updateData = {
        id: existingPosition.id,
        amount: 300000 // Increased but still within limits
      }

      const mockUpdatedPosition = {
        ...existingPosition,
        ...updateData
      }
      ;(prisma.facilityPosition.update as jest.Mock).mockResolvedValue(mockUpdatedPosition)

      const result = await updateFacilityPosition(updateData)
      expect(result).toBeDefined()
      expect(result.amount).toBe(updateData.amount)
      expect(prisma.facilityPosition.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: updateData.id },
          data: expect.objectContaining(updateData)
        })
      )
    })

    it('should reject updates that would exceed facility commitment', async () => {
      const existingPosition = {
        id: 'test-position-1',
        facilityId: testFacility.id,
        lenderId: testLender.id,
        amount: 200000,
        status: 'ACTIVE'
      }
      ;(prisma.facilityPosition.findUnique as jest.Mock).mockResolvedValue(existingPosition)

      // Mock another existing position
      testFacility.positions = [
        existingPosition,
        {
          id: 'test-position-2',
          amount: 200000,
          status: 'ACTIVE'
        }
      ]
      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(testFacility)

      const updateData = {
        id: existingPosition.id,
        amount: 400000 // Would exceed total commitment when combined with other position
      }

      await expect(updateFacilityPosition(updateData)).rejects.toThrow('Total positions would exceed facility commitment')
      expect(prisma.facilityPosition.update).not.toHaveBeenCalled()
    })

    it('should validate position status transitions', async () => {
      const existingPosition = {
        id: 'test-position-1',
        facilityId: testFacility.id,
        lenderId: testLender.id,
        amount: 200000,
        status: 'ACTIVE'
      }
      ;(prisma.facilityPosition.findUnique as jest.Mock).mockResolvedValue(existingPosition)

      const updateData = {
        id: existingPosition.id,
        status: 'INVALID_STATUS'
      }

      // @ts-ignore - Testing invalid status
      await expect(updateFacilityPosition(updateData)).rejects.toThrow('Invalid position status')
      expect(prisma.facilityPosition.update).not.toHaveBeenCalled()
    })
  })
}) 