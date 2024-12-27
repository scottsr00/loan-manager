require('@testing-library/jest-dom')

// Use Node.js global TextEncoder and TextDecoder
global.TextEncoder = global.TextEncoder
global.TextDecoder = global.TextDecoder

// Mock Request and Response
global.Request = class Request {}
global.Response = class Response {}

// Mock Next.js revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Mock Next.js headers and cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
  headers: () => ({
    get: jest.fn(),
  }),
}))

// Mock Next.js server actions
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}))

// Custom matchers for date comparisons
expect.extend({
  toBeLessThanOrEqualDate(received, expected) {
    const receivedDate = new Date(received)
    const expectedDate = new Date(expected)
    const pass = receivedDate <= expectedDate
    return {
      pass,
      message: () =>
        `expected ${receivedDate.toISOString()} to be less than or equal to ${expectedDate.toISOString()}`,
    }
  },
})

// Mock the Prisma client
jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback()),
    facility: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    creditAgreement: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    entity: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    borrower: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    lender: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    facilityPosition: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    loan: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    loanPosition: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    servicingActivity: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transactionHistory: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
})) 