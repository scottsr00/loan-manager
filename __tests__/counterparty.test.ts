import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/server/db/client'
import { createCounterparty, updateCounterparty } from '@/server/actions/counterparty'
import { type CounterpartyInput } from '@/server/types/counterparty'

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
    entity: {
      create: jest.fn(),
      update: jest.fn(),
    }
  } as unknown as MockPrisma,
}))

describe('Counterparty Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCounterparty', () => {
    const mockCounterpartyInput: CounterpartyInput = {
      name: 'Test Counterparty Inc',
      status: 'ACTIVE',
      addresses: [{
        type: 'BUSINESS',
        street1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94105',
        isPrimary: true
      }],
      contacts: [{
        type: 'PRIMARY',
        firstName: 'John',
        lastName: 'Doe',
        title: 'CEO',
        email: 'john@example.com',
        phone: '555-0123',
        isPrimary: true
      }]
    }

    it('should create a counterparty with valid inputs', async () => {
      const mockEntity = {
        id: 'entity-1',
        legalName: mockCounterpartyInput.name,
        status: 'ACTIVE',
        counterparty: {
          id: 'counterparty-1',
          status: mockCounterpartyInput.status,
          addresses: mockCounterpartyInput.addresses,
          contacts: mockCounterpartyInput.contacts
        }
      }

      ;(prisma.entity.create as jest.Mock).mockResolvedValue(mockEntity)

      const result = await createCounterparty(mockCounterpartyInput)

      expect(result).toHaveProperty('id', 'counterparty-1')
      expect(result.status).toBe('ACTIVE')
      expect(result.addresses).toEqual(mockCounterpartyInput.addresses)
      expect(result.contacts).toEqual(mockCounterpartyInput.contacts)
      expect(prisma.entity.create).toHaveBeenCalledTimes(1)
    })

    it('should validate required fields', async () => {
      const invalidInput = {
        name: '',
        status: 'ACTIVE',
        addresses: [],
        contacts: []
      } as CounterpartyInput

      await expect(createCounterparty(invalidInput))
        .rejects.toThrow(/Name is required/)

      expect(prisma.entity.create).not.toHaveBeenCalled()
    })
  })

  describe('updateCounterparty', () => {
    const mockExistingCounterparty = {
      id: 'counterparty-1',
      status: 'ACTIVE',
      entity: {
        id: 'entity-1',
        legalName: 'Test Counterparty Inc'
      },
      addresses: [{
        type: 'BUSINESS',
        street1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94105',
        isPrimary: true
      }],
      contacts: [{
        type: 'PRIMARY',
        firstName: 'John',
        lastName: 'Doe',
        title: 'CEO',
        email: 'john@example.com',
        phone: '555-0123',
        isPrimary: true
      }]
    }

    const mockUpdateInput: Partial<CounterpartyInput> = {
      name: 'Updated Counterparty Inc',
      status: 'INACTIVE',
      addresses: [{
        type: 'BUSINESS',
        street1: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94105',
        isPrimary: true
      }],
      contacts: [{
        type: 'PRIMARY',
        firstName: 'Jane',
        lastName: 'Smith',
        title: 'CFO',
        email: 'jane@example.com',
        phone: '555-4567',
        isPrimary: true
      }]
    }

    it('should update counterparty with valid changes', async () => {
      ;(prisma.counterparty.findUnique as jest.Mock).mockResolvedValue(mockExistingCounterparty)
      ;(prisma.counterparty.update as jest.Mock).mockResolvedValue({
        ...mockExistingCounterparty,
        status: mockUpdateInput.status,
        entity: {
          ...mockExistingCounterparty.entity,
          legalName: mockUpdateInput.name
        },
        addresses: mockUpdateInput.addresses,
        contacts: mockUpdateInput.contacts
      })

      const result = await updateCounterparty('counterparty-1', mockUpdateInput)

      expect(result.entity?.legalName).toBe(mockUpdateInput.name)
      expect(result.status).toBe(mockUpdateInput.status)
      expect(result.addresses).toEqual(mockUpdateInput.addresses)
      expect(result.contacts).toEqual(mockUpdateInput.contacts)
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