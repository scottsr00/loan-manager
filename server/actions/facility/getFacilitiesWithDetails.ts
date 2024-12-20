import { prisma } from '@/server/db/client'

export async function getFacilitiesWithDetails() {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        creditAgreement: {
          select: {
            agreementName: true,
          },
        },
        loans: {
          select: {
            outstandingAmount: true,
          },
        },
        servicingActivities: {
          where: {
            status: 'PENDING',
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return facilities.map(facility => ({
      ...facility,
      totalOutstanding: facility.loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0),
      pendingActivities: facility.servicingActivities.length,
      utilization: (facility.loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0) / facility.commitmentAmount) * 100,
    }))
  } catch (error) {
    console.error('Error in getFacilitiesWithDetails:', error)
    throw new Error('Failed to fetch facilities')
  }
} 