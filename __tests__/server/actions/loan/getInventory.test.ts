import { prisma } from '@/server/db/client'
import { getInventory } from '@/server/actions/loan/getInventory'

// Mock Prisma client
jest.mock('@/server/db/client', () => ({
  prisma: {
    loan: {
      findMany: jest.fn(),
    },
  },
}))

describe('getInventory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loans with their relationships', async () => {
    const mockLoans = [
      {
        id: 'loan-1',
        amount: 1000000,
        outstandingAmount: 1000000,
        currency: 'USD',
        status: 'ACTIVE',
        interestPeriod: '1M',
        drawDate: new Date('2024-01-01'),
        baseRate: 4.5,
        effectiveRate: 7.0,
        facility: {
          id: 'facility-1',
          facilityName: 'Term Loan A',
          facilityType: 'TERM_LOAN',
          creditAgreement: {
            id: 'ca-1',
            agreementNumber: 'CA-2024-001',
            borrower: {
              entity: {
                legalName: 'Test Company Inc.',
                isAgent: false,
              },
            },
            lender: {
              entity: {
                legalName: 'Bank of Test',
                isAgent: true,
              },
            },
          },
        },
        transactions: [
          {
            id: 'tx-1',
            activityType: 'DRAWDOWN',
            amount: 1000000,
            currency: 'USD',
            status: 'COMPLETED',
            effectiveDate: new Date('2024-01-01'),
          },
        ],
      },
    ]

    ;(prisma.loan.findMany as jest.Mock).mockResolvedValue(mockLoans)

    const result = await getInventory()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'loan-1',
      amount: 1000000,
      outstandingAmount: 1000000,
      facility: expect.objectContaining({
        facilityName: 'Term Loan A',
        creditAgreement: expect.objectContaining({
          agreementNumber: 'CA-2024-001',
        }),
      }),
      transactions: expect.arrayContaining([
        expect.objectContaining({
          activityType: 'DRAWDOWN',
          amount: 1000000,
        }),
      ]),
    })

    expect(prisma.loan.findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        facility: {
          include: {
            creditAgreement: {
              include: {
                borrower: true,
                lender: true
              }
            },
            positions: {
              include: {
                lender: {
                  include: {
                    entity: true
                  }
                }
              }
            }
          }
        },
        transactions: {
          where: {
            status: 'PENDING'
          }
        }
      }
    })
  })

  it('should handle empty result', async () => {
    ;(prisma.loan.findMany as jest.Mock).mockResolvedValue([])

    const result = await getInventory()

    expect(result).toHaveLength(0)
    expect(prisma.loan.findMany).toHaveBeenCalled()
  })

  it('should handle errors gracefully', async () => {
    ;(prisma.loan.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

    await expect(getInventory()).rejects.toThrow('Failed to fetch loan inventory')
  })
}) 