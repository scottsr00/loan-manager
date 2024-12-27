import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/server/db/client'
import { createBorrower, updateBorrower } from '@/server/actions/borrower'
import { type BorrowerInput } from '@/server/types/borrower'

type MockPrisma = {
  [K in keyof PrismaClient]: {
    [M in keyof PrismaClient[K]]: jest.Mock;
  };
};

jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma as unknown as MockPrisma)),
    entity: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    borrower: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  } as unknown as MockPrisma,
}))

describe('Borrower Tests', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    // Spy on console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore()
  })

  describe('createBorrower', () => {
    const mockBorrowerInput: BorrowerInput = {
      legalName: 'Test Borrower Inc',
      dba: 'Test Co',
      registrationNumber: 'REG123',
      taxId: 'TAX123',
      countryOfIncorporation: 'US',
      industrySegment: 'Technology',
      businessType: 'Corporation',
      creditRating: 'BBB',
      ratingAgency: 'S&P',
      riskRating: 'Medium',
      onboardingStatus: 'PENDING',
      kycStatus: 'PENDING',
    }

    it('should create a borrower with valid inputs', async () => {
      const mockEntity = {
        id: 'entity-1',
        legalName: mockBorrowerInput.legalName,
        dba: mockBorrowerInput.dba,
        registrationNumber: mockBorrowerInput.registrationNumber,
        taxId: mockBorrowerInput.taxId,
        countryOfIncorporation: mockBorrowerInput.countryOfIncorporation,
        status: 'ACTIVE',
      }

      const mockBorrower = {
        id: 'borrower-1',
        entityId: 'entity-1',
        industrySegment: mockBorrowerInput.industrySegment,
        businessType: mockBorrowerInput.businessType,
        creditRating: mockBorrowerInput.creditRating,
        ratingAgency: mockBorrowerInput.ratingAgency,
        riskRating: mockBorrowerInput.riskRating,
        onboardingStatus: mockBorrowerInput.onboardingStatus,
        kycStatus: mockBorrowerInput.kycStatus,
      }

      ;(prisma.entity.create as jest.Mock).mockResolvedValue(mockEntity)
      ;(prisma.borrower.create as jest.Mock).mockResolvedValue(mockBorrower)

      const result = await createBorrower(mockBorrowerInput)

      expect(result).toHaveProperty('id', 'borrower-1')
      expect(result.entityId).toBe('entity-1')
      expect(result.industrySegment).toBe(mockBorrowerInput.industrySegment)
      expect(prisma.entity.create).toHaveBeenCalledTimes(1)
      expect(prisma.borrower.create).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      const invalidInput = {
        legalName: '',
        industrySegment: '',
        businessType: '',
        onboardingStatus: 'PENDING',
        kycStatus: 'PENDING',
      } as BorrowerInput

      await expect(createBorrower(invalidInput))
        .rejects.toThrow(/Legal name is required|Industry segment is required|Business type is required/)

      expect(prisma.entity.create).not.toHaveBeenCalled()
      expect(prisma.borrower.create).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in createBorrower:',
        expect.any(Error)
      )
    })

    it('should validate onboarding status', async () => {
      const invalidInput = {
        ...mockBorrowerInput,
        onboardingStatus: 'INVALID_STATUS',
      } as unknown as BorrowerInput

      await expect(createBorrower(invalidInput))
        .rejects.toThrow(/Invalid enum value/)

      expect(prisma.entity.create).not.toHaveBeenCalled()
      expect(prisma.borrower.create).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in createBorrower:',
        expect.any(Error)
      )
    })

    it('should validate KYC status', async () => {
      const invalidInput = {
        ...mockBorrowerInput,
        kycStatus: 'INVALID_STATUS',
      } as unknown as BorrowerInput

      await expect(createBorrower(invalidInput))
        .rejects.toThrow(/Invalid enum value/)

      expect(prisma.entity.create).not.toHaveBeenCalled()
      expect(prisma.borrower.create).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in createBorrower:',
        expect.any(Error)
      )
    })
  })

  describe('updateBorrower', () => {
    const mockExistingBorrower = {
      id: 'borrower-1',
      entityId: 'entity-1',
      industrySegment: 'Technology',
      businessType: 'Corporation',
      creditRating: 'BBB',
      ratingAgency: 'S&P',
      riskRating: 'Medium',
      onboardingStatus: 'PENDING',
      kycStatus: 'PENDING',
    }

    it('should update borrower with valid changes', async () => {
      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue(mockExistingBorrower)
      ;(prisma.borrower.update as jest.Mock).mockImplementation((args) => Promise.resolve({ ...mockExistingBorrower, ...args.data }))

      const updateData: BorrowerInput = {
        legalName: 'Test Borrower Inc',
        industrySegment: 'Technology',
        businessType: 'Corporation',
        onboardingStatus: 'IN_PROGRESS',
        kycStatus: 'IN_PROGRESS',
      }

      const result = await updateBorrower(mockExistingBorrower.id, updateData)

      expect(result.onboardingStatus).toBe(updateData.onboardingStatus)
      expect(result.kycStatus).toBe(updateData.kycStatus)
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should throw error if borrower does not exist', async () => {
      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue(null)

      const updateData: BorrowerInput = {
        legalName: 'Test Borrower Inc',
        industrySegment: 'Technology',
        businessType: 'Corporation',
        onboardingStatus: 'IN_PROGRESS',
        kycStatus: 'PENDING',
      }

      await expect(updateBorrower('non-existent', updateData))
        .rejects.toThrow('Borrower not found')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in updateBorrower:',
        expect.any(Error)
      )
    })

    it('should validate status transitions', async () => {
      const mockRejectedBorrower = {
        ...mockExistingBorrower,
        onboardingStatus: 'REJECTED',
      }

      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue(mockRejectedBorrower)

      const updateData: BorrowerInput = {
        legalName: 'Test Borrower Inc',
        industrySegment: 'Technology',
        businessType: 'Corporation',
        onboardingStatus: 'IN_PROGRESS',
        kycStatus: 'PENDING',
      }

      await expect(updateBorrower(mockRejectedBorrower.id, updateData))
        .rejects.toThrow('Cannot change status of rejected borrower')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in updateBorrower:',
        expect.any(Error)
      )
    })

    it('should validate KYC status transitions', async () => {
      const mockRejectedBorrower = {
        ...mockExistingBorrower,
        kycStatus: 'REJECTED',
      }

      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue(mockRejectedBorrower)

      const updateData: BorrowerInput = {
        legalName: 'Test Borrower Inc',
        industrySegment: 'Technology',
        businessType: 'Corporation',
        onboardingStatus: 'PENDING',
        kycStatus: 'IN_PROGRESS',
      }

      await expect(updateBorrower(mockRejectedBorrower.id, updateData))
        .rejects.toThrow('Cannot change KYC status of rejected borrower')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in updateBorrower:',
        expect.any(Error)
      )
    })
  })
}) 