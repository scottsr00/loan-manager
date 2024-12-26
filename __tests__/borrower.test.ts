import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/server/db/client'
import { createBorrower, updateBorrower } from '@/server/actions/borrower'
import { type CreateBorrowerInput } from '@/types/borrower'

type MockPrisma = {
  [K in keyof PrismaClient]: {
    [M in keyof PrismaClient[K]]: jest.Mock;
  };
};

jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn((callback: (tx: MockPrisma) => Promise<any>) => callback(prisma as unknown as MockPrisma)),
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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createBorrower', () => {
    const mockBorrowerInput: CreateBorrowerInput = {
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
    })

    it('should validate required fields', async () => {
      const invalidInput = {
        legalName: '',
        industrySegment: '',
        businessType: '',
      } as CreateBorrowerInput

      await expect(createBorrower(invalidInput))
        .rejects.toThrow(/Legal name is required|Industry segment is required|Business type is required/)

      expect(prisma.entity.create).not.toHaveBeenCalled()
      expect(prisma.borrower.create).not.toHaveBeenCalled()
    })

    it('should validate onboarding status', async () => {
      const invalidInput = {
        ...mockBorrowerInput,
        onboardingStatus: 'INVALID_STATUS' as any,
      }

      await expect(createBorrower(invalidInput))
        .rejects.toThrow('Invalid enum value')

      expect(prisma.entity.create).not.toHaveBeenCalled()
      expect(prisma.borrower.create).not.toHaveBeenCalled()
    })

    it('should validate KYC status', async () => {
      const invalidInput = {
        ...mockBorrowerInput,
        kycStatus: 'INVALID_STATUS' as any,
      }

      await expect(createBorrower(invalidInput))
        .rejects.toThrow('Invalid enum value')

      expect(prisma.entity.create).not.toHaveBeenCalled()
      expect(prisma.borrower.create).not.toHaveBeenCalled()
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
      entity: {
        id: 'entity-1',
        legalName: 'Test Borrower Inc',
        dba: 'Test Co',
        registrationNumber: 'REG123',
        taxId: 'TAX123',
        countryOfIncorporation: 'US',
        status: 'ACTIVE',
      },
    }

    const mockUpdateInput: CreateBorrowerInput = {
      legalName: 'Test Borrower Inc',
      industrySegment: 'Technology',
      businessType: 'Corporation',
      creditRating: 'A',
      ratingAgency: 'S&P',
      riskRating: 'Low',
      onboardingStatus: 'COMPLETED',
      kycStatus: 'PENDING',
    }

    it('should update borrower with valid changes', async () => {
      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue(mockExistingBorrower)
      ;(prisma.borrower.update as jest.Mock).mockResolvedValue({
        ...mockExistingBorrower,
        creditRating: 'A',
        riskRating: 'Low',
        onboardingStatus: 'COMPLETED',
      })

      const result = await updateBorrower('borrower-1', mockUpdateInput)

      expect(result.creditRating).toBe('A')
      expect(result.riskRating).toBe('Low')
      expect(result.onboardingStatus).toBe('COMPLETED')
      expect(prisma.borrower.update).toHaveBeenCalledTimes(1)
    })

    it('should throw error if borrower does not exist', async () => {
      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(updateBorrower('non-existent', mockUpdateInput))
        .rejects.toThrow('Borrower not found')

      expect(prisma.borrower.update).not.toHaveBeenCalled()
    })

    it('should validate onboarding status transitions', async () => {
      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingBorrower,
        onboardingStatus: 'REJECTED',
      })

      await expect(updateBorrower('borrower-1', {
        ...mockUpdateInput,
        onboardingStatus: 'COMPLETED',
      })).rejects.toThrow('Cannot change status of rejected borrower')

      expect(prisma.borrower.update).not.toHaveBeenCalled()
    })

    it('should validate KYC status transitions', async () => {
      ;(prisma.borrower.findUnique as jest.Mock).mockResolvedValue({
        ...mockExistingBorrower,
        kycStatus: 'REJECTED',
      })

      await expect(updateBorrower('borrower-1', {
        ...mockUpdateInput,
        kycStatus: 'APPROVED',
      })).rejects.toThrow('Cannot change KYC status of rejected borrower')

      expect(prisma.borrower.update).not.toHaveBeenCalled()
    })
  })
}) 