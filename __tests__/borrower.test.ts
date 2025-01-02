import { describe, expect, test, beforeEach } from '@jest/globals'
import { prisma } from '@/server/db/client'
import { createBorrower } from '@/server/actions/borrower/createBorrower'
import { type Borrower, type Entity } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'

// Mock the entire prisma client
const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<typeof prisma>>

describe('Borrower Creation', () => {
  const testEntityId = 'TEST-ENTITY-001'
  const mockEntity: Entity = {
    id: testEntityId,
    legalName: 'Test Borrower Entity',
    dba: null,
    taxId: null,
    countryOfIncorporation: null,
    status: 'ACTIVE',
    isAgent: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  test('should create a borrower linked to an entity', async () => {
    // Mock entity lookup
    prismaMock.entity.findUnique.mockResolvedValueOnce(mockEntity)
    
    // Mock borrower lookup (no existing borrower)
    prismaMock.borrower.findUnique.mockResolvedValueOnce(null)

    const borrowerData = {
      entityId: testEntityId,
      industrySegment: 'Technology',
      businessType: 'Corporation',
      creditRating: 'A',
      ratingAgency: 'S&P',
      riskRating: 'Low',
      onboardingStatus: 'PENDING' as const
    }

    // Mock borrower creation
    const mockBorrower = {
      id: 'BORROWER-001',
      entityId: testEntityId,
      industrySegment: borrowerData.industrySegment,
      businessType: borrowerData.businessType,
      creditRating: borrowerData.creditRating,
      ratingAgency: borrowerData.ratingAgency,
      riskRating: borrowerData.riskRating,
      onboardingStatus: borrowerData.onboardingStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      entity: mockEntity
    }

    prismaMock.borrower.create.mockResolvedValueOnce(mockBorrower as Borrower & { entity: Entity })

    const borrower = await createBorrower(borrowerData)

    // Verify borrower was created with correct data
    expect(borrower).toBeDefined()
    expect(borrower.entityId).toBe(testEntityId)
    expect(borrower.industrySegment).toBe(borrowerData.industrySegment)
    expect(borrower.businessType).toBe(borrowerData.businessType)
    expect(borrower.creditRating).toBe(borrowerData.creditRating)
    expect(borrower.ratingAgency).toBe(borrowerData.ratingAgency)
    expect(borrower.riskRating).toBe(borrowerData.riskRating)
    expect(borrower.onboardingStatus).toBe(borrowerData.onboardingStatus)

    // Verify entity relationship
    expect(borrower.entity).toBeDefined()
    expect(borrower.entity.id).toBe(testEntityId)
    expect(borrower.entity.legalName).toBe('Test Borrower Entity')

    // Verify prisma calls
    expect(prismaMock.entity.findUnique).toHaveBeenCalledWith({
      where: { id: testEntityId }
    })
    expect(prismaMock.borrower.create).toHaveBeenCalledWith({
      data: borrowerData,
      include: { entity: true }
    })
  })

  test('should fail to create borrower for non-existent entity', async () => {
    // Mock entity lookup to return null
    prismaMock.entity.findUnique.mockResolvedValueOnce(null)

    const borrowerData = {
      entityId: 'non-existent-id',
      industrySegment: 'Technology',
      businessType: 'Corporation',
      onboardingStatus: 'PENDING' as const
    }

    await expect(createBorrower(borrowerData)).rejects.toThrow('Entity not found')
    expect(prismaMock.borrower.create).not.toHaveBeenCalled()
  })

  test('should fail to create duplicate borrower for same entity', async () => {
    // Mock entity lookup
    prismaMock.entity.findUnique.mockResolvedValueOnce(mockEntity)

    // Mock existing borrower
    const existingBorrower: Borrower = {
      id: 'EXISTING-BORROWER',
      entityId: testEntityId,
      industrySegment: 'Technology',
      businessType: 'Corporation',
      creditRating: null,
      ratingAgency: null,
      riskRating: null,
      onboardingStatus: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    prismaMock.borrower.findUnique.mockResolvedValueOnce(existingBorrower)

    const borrowerData = {
      entityId: testEntityId,
      industrySegment: 'Technology',
      businessType: 'Corporation',
      onboardingStatus: 'PENDING' as const
    }

    await expect(createBorrower(borrowerData)).rejects.toThrow('Entity already has a borrower role')
    expect(prismaMock.borrower.create).not.toHaveBeenCalled()
  })
}) 