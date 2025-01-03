import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/server/db/client'
import { createLenderCounterparty } from '@/server/actions/counterparty'

type MockPrisma = {
  [K in keyof PrismaClient]: {
    [M in keyof PrismaClient[K]]: jest.Mock;
  };
};

jest.mock('@/server/db/client', () => ({
  prisma: {
    counterparty: {
      create: jest.fn(),
      findUnique: jest.fn(),
    }
  } as unknown as MockPrisma,
}))

describe('Lender Counterparty Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createLenderCounterparty', () => {
    const mockEntityId = 'test-entity-1'
    const mockCounterparty = {
      id: 'counterparty-1',
      entityId: mockEntityId,
      status: 'ACTIVE',
      entity: {
        id: mockEntityId,
        legalName: 'Test Bank'
      }
    }

    it('should create a lender counterparty with valid entity ID', async () => {
      ;(prisma.counterparty.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.counterparty.create as jest.Mock).mockResolvedValue(mockCounterparty)

      const result = await createLenderCounterparty(mockEntityId)

      expect(result).toEqual(mockCounterparty)
      expect(prisma.counterparty.findUnique).toHaveBeenCalledWith({
        where: { entityId: mockEntityId },
        include: {
          entity: {
            select: {
              id: true,
              legalName: true
            }
          }
        }
      })
      expect(prisma.counterparty.create).toHaveBeenCalledWith({
        data: {
          entityId: mockEntityId,
          status: 'ACTIVE'
        },
        include: {
          entity: {
            select: {
              id: true,
              legalName: true
            }
          }
        }
      })
    })

    it('should return existing counterparty if one exists', async () => {
      ;(prisma.counterparty.findUnique as jest.Mock).mockResolvedValue(mockCounterparty)

      const result = await createLenderCounterparty(mockEntityId)

      expect(result).toEqual(mockCounterparty)
      expect(prisma.counterparty.findUnique).toHaveBeenCalledWith({
        where: { entityId: mockEntityId },
        include: {
          entity: {
            select: {
              id: true,
              legalName: true
            }
          }
        }
      })
      expect(prisma.counterparty.create).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error')
      ;(prisma.counterparty.findUnique as jest.Mock).mockRejectedValue(error)

      await expect(createLenderCounterparty(mockEntityId))
        .rejects.toThrow('Failed to create lender counterparty')

      expect(prisma.counterparty.create).not.toHaveBeenCalled()
    })
  })
}) 