import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'jest-mock-extended'

// Mock the Prisma client
jest.mock('@/server/db/client', () => ({
  prisma: mockDeep<PrismaClient>()
}))

// Import the mocked prisma client
import { prisma } from '@/server/db/client'
const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

beforeEach(() => {
  mockReset(prismaMock)
}) 