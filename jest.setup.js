// Mock Next.js cache revalidation
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Mock Next.js server actions
jest.mock('next/server', () => ({
  headers: jest.fn(),
}))

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
}) 