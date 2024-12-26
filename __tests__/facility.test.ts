import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/server/db/client'
import { createFacility, updateFacility } from '@/server/actions/facility'

type MockPrisma = {
  [K in keyof PrismaClient]: {
    [M in keyof PrismaClient[K]]: jest.Mock;
  };
};

jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn((callback: (tx: MockPrisma) => Promise<any>) => callback(prisma as unknown as MockPrisma)),
    facility: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    facilitySublimit: {
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as MockPrisma,
}))

describe('Facility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createFacility', () => {
    const mockFacility = {
      creditAgreementId: 'ca-1',
      facilityName: 'Revolving Credit Facility',
      facilityType: 'REVOLVING',
      commitmentAmount: 10000000,
      currency: 'USD',
      startDate: new Date('2024-01-01'),
      maturityDate: new Date('2029-01-01'),
      interestType: 'FLOATING',
      baseRate: 'SOFR',
      margin: 3.00,
      sublimits: [
        {
          type: 'LC',
          amount: 5000000,
          description: 'Letter of Credit Sublimit',
        },
      ],
    }

    it('should create a facility with valid inputs', async () => {
      const mockCreatedFacility = {
        id: 'facility-1',
        ...mockFacility,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.facility.create as jest.Mock).mockResolvedValue(mockCreatedFacility)
      ;(prisma.facilitySublimit.create as jest.Mock).mockResolvedValue({
        id: 'sublimit-1',
        facilityId: 'facility-1',
        ...mockFacility.sublimits[0],
      })

      const result = await createFacility(mockFacility)

      expect(result).toHaveProperty('id', 'facility-1')
      expect(result.commitmentAmount).toBe(mockFacility.commitmentAmount)
      expect(prisma.facility.create).toHaveBeenCalledTimes(1)
      expect(prisma.facilitySublimit.create).toHaveBeenCalledTimes(1)
    })

    it('should validate required fields', async () => {
      const invalidFacility = {
        creditAgreementId: '',
        facilityName: '',
        facilityType: '',
        commitmentAmount: 0,
        startDate: new Date(),
        maturityDate: new Date(),
        interestType: '',
        baseRate: '',
        margin: 0,
        sublimits: [],
      }

      await expect(createFacility(invalidFacility))
        .rejects.toThrow(/Credit Agreement ID is required|Facility name is required|Facility type is required|Commitment amount must be positive/)

      expect(prisma.facility.create).not.toHaveBeenCalled()
      expect(prisma.facilitySublimit.create).not.toHaveBeenCalled()
    })

    it('should validate dates', async () => {
      const invalidFacility = {
        ...mockFacility,
        startDate: new Date('2024-01-01'),
        maturityDate: new Date('2023-01-01'), // Before start date
      }

      await expect(createFacility(invalidFacility))
        .rejects.toThrow('Maturity date must be after start date')

      expect(prisma.facility.create).not.toHaveBeenCalled()
      expect(prisma.facilitySublimit.create).not.toHaveBeenCalled()
    })

    it('should validate sublimit amounts', async () => {
      const invalidFacility = {
        ...mockFacility,
        commitmentAmount: 10000000,
        sublimits: [
          {
            type: 'LC',
            amount: 15000000, // Greater than commitment amount
            description: 'Letter of Credit Sublimit',
          },
        ],
      }

      await expect(createFacility(invalidFacility))
        .rejects.toThrow('Sublimit amount cannot exceed commitment amount')

      expect(prisma.facility.create).not.toHaveBeenCalled()
      expect(prisma.facilitySublimit.create).not.toHaveBeenCalled()
    })
  })

  describe('updateFacility', () => {
    const mockExistingFacility = {
      id: 'facility-1',
      creditAgreementId: 'ca-1',
      facilityName: 'Revolving Credit Facility',
      facilityType: 'REVOLVING',
      commitmentAmount: 10000000,
      currency: 'USD',
      startDate: new Date('2024-01-01'),
      maturityDate: new Date('2029-01-01'),
      interestType: 'FLOATING',
      baseRate: 'SOFR',
      margin: 3.00,
      sublimits: [
        {
          id: 'sublimit-1',
          type: 'LC',
          amount: 5000000,
          description: 'Letter of Credit Sublimit',
        },
      ],
    }

    it('should update facility with valid changes', async () => {
      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(mockExistingFacility)
      ;(prisma.facility.update as jest.Mock).mockResolvedValue({
        ...mockExistingFacility,
        commitmentAmount: 15000000,
        margin: 2.75,
      })

      const result = await updateFacility({
        id: 'facility-1',
        commitmentAmount: 15000000,
        margin: 2.75,
      })

      expect(result.commitmentAmount).toBe(15000000)
      expect(result.margin).toBe(2.75)
      expect(prisma.facility.update).toHaveBeenCalledTimes(1)
    })

    it('should throw error if facility does not exist', async () => {
      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(updateFacility({
        id: 'non-existent',
        commitmentAmount: 15000000,
      })).rejects.toThrow('Facility not found')

      expect(prisma.facility.update).not.toHaveBeenCalled()
    })

    it('should validate commitment amount changes', async () => {
      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingFacility,
        loans: [
          {
            id: 'loan-1',
            amount: 8000000,
            status: 'ACTIVE',
          },
        ],
      })

      await expect(updateFacility({
        id: 'facility-1',
        commitmentAmount: 7000000, // Less than outstanding loans
      })).rejects.toThrow('Commitment amount cannot be less than outstanding loans')

      expect(prisma.facility.update).not.toHaveBeenCalled()
    })

    it('should validate maturity date changes', async () => {
      ;(prisma.facility.findUnique as jest.Mock).mockResolvedValue(mockExistingFacility)

      await expect(updateFacility({
        id: 'facility-1',
        maturityDate: new Date('2023-01-01'), // Before start date
      })).rejects.toThrow('Maturity date must be after start date')

      expect(prisma.facility.update).not.toHaveBeenCalled()
    })
  })
}) 