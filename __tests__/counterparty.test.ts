import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/server/db/client'
import { createCounterparty, updateCounterparty } from '@/server/actions/counterparty'
import { type CreateCounterpartyInput } from '@/types/counterparty'

type MockPrisma = {
  [K in keyof PrismaClient]: {
    [M in keyof PrismaClient[K]]: jest.Mock;
  };
};

jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn((callback: (tx: MockPrisma) => Promise<any>) => callback(prisma as unknown as MockPrisma)),
    counterparty: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  } as unknown as MockPrisma,
}))

describe('Counterparty Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCounterparty', () => {
    const mockCounterpartyInput: CreateCounterpartyInput = {
      name: 'Test Counterparty Inc',
      typeId: 'type-1',
    }

    it('should create a counterparty with valid inputs', async () => {
      const mockCounterparty = {
        id: 'counterparty-1',
        name: mockCounterpartyInput.name,
        typeId: mockCounterpartyInput.typeId,
        status: 'ACTIVE',
        type: {
          id: 'type-1',
          name: 'Broker Dealer',
        },
      }

      ;(prisma.counterparty.create as jest.Mock).mockResolvedValue(mockCounterparty)

      const result = await createCounterparty(mockCounterpartyInput)

      expect(result).toHaveProperty('id', 'counterparty-1')
      expect(result.name).toBe(mockCounterpartyInput.name)
      expect(result.typeId).toBe(mockCounterpartyInput.typeId)
      expect(prisma.counterparty.create).toHaveBeenCalledTimes(1)
    })

    it('should validate required fields', async () => {
      const invalidInput = {
        name: '',
        typeId: '',
      } as CreateCounterpartyInput

      await expect(createCounterparty(invalidInput))
        .rejects.toThrow(/Name is required|Counterparty type is required/)

      expect(prisma.counterparty.create).not.toHaveBeenCalled()
    })
  })

  describe('updateCounterparty', () => {
    const mockExistingCounterparty = {
      id: 'counterparty-1',
      name: 'Test Counterparty Inc',
      typeId: 'type-1',
      status: 'ACTIVE',
      type: {
        id: 'type-1',
        name: 'Broker Dealer',
      },
    }

    const mockUpdateInput: Partial<CreateCounterpartyInput> = {
      name: 'Updated Counterparty Inc',
      typeId: 'type-2',
      status: 'INACTIVE',
    }

    it('should update counterparty with valid changes', async () => {
      ;(prisma.counterparty.findUnique as jest.Mock).mockResolvedValue(mockExistingCounterparty)
      ;(prisma.counterparty.update as jest.Mock).mockResolvedValue({
        ...mockExistingCounterparty,
        name: mockUpdateInput.name,
        typeId: mockUpdateInput.typeId,
        status: mockUpdateInput.status,
      })

      const result = await updateCounterparty('counterparty-1', mockUpdateInput)

      expect(result.name).toBe(mockUpdateInput.name)
      expect(result.typeId).toBe(mockUpdateInput.typeId)
      expect(result.status).toBe(mockUpdateInput.status)
      expect(prisma.counterparty.update).toHaveBeenCalledTimes(1)
    })

    it('should throw error if counterparty does not exist', async () => {
      ;(prisma.counterparty.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(updateCounterparty('non-existent', mockUpdateInput))
        .rejects.toThrow('Counterparty not found')

      expect(prisma.counterparty.update).not.toHaveBeenCalled()
    })
  })
}) 