import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Mock the Prisma client
jest.mock('@/server/db/client', () => ({
  prisma: mockDeep<PrismaClient>()
}))

// Import the mocked prisma client
import { prisma } from '@/server/db/client'
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

beforeEach(() => {
  mockReset(prismaMock)
})

export { prismaMock } 