'use server'

import { prisma } from '@/lib/prisma'

export async function getAnalytics() {
  try {
    const [
      portfolio,
      loans,
      borrowerRisk,
      payments
    ] = await Promise.all([
      // Portfolio metrics
      prisma.$transaction(async (tx) => {
        const totalCommitment = await tx.facility.aggregate({
          _sum: {
            commitmentAmount: true,
          },
        })

        const facilitiesByType = await tx.facility.groupBy({
          by: ['facilityType'],
          _sum: {
            commitmentAmount: true,
            availableAmount: true,
          },
        })

        const totalFacilities = await tx.facility.count()

        return {
          totalCommitment: totalCommitment._sum.commitmentAmount || 0,
          facilitiesByType: facilitiesByType.reduce((acc, curr) => ({
            ...acc,
            [curr.facilityType]: {
              commitment: curr._sum.commitmentAmount || 0,
              available: curr._sum.availableAmount || 0,
            },
          }), {}),
          totalFacilities,
        }
      }),

      // Loan metrics
      prisma.$transaction(async (tx) => {
        const loansByStatus = await tx.loan.groupBy({
          by: ['status'],
          _sum: {
            amount: true,
            outstandingAmount: true,
          },
        })

        return {
          byStatus: loansByStatus.reduce((acc, curr) => ({
            ...acc,
            [curr.status]: {
              total: curr._sum.amount || 0,
              outstanding: curr._sum.outstandingAmount || 0,
            },
          }), {}),
        }
      }),

      // Risk metrics
      prisma.$transaction(async (tx) => {
        const borrowers = await tx.$queryRaw`
          SELECT 
            b."entityId",
            b."creditRating",
            COALESCE(SUM(f."commitmentAmount"), 0) as "totalExposure",
            COALESCE(SUM(l."outstandingAmount"), 0) as "totalUtilization"
          FROM "Borrower" b
          LEFT JOIN "CreditAgreement" ca ON ca."borrowerId" = b.id
          LEFT JOIN "Facility" f ON f."creditAgreementId" = ca.id
          LEFT JOIN "Loan" l ON l."facilityId" = f.id
          GROUP BY b."entityId", b."creditRating"
          ORDER BY "totalExposure" DESC NULLS LAST
          LIMIT 10
        `

        const borrowerConcentration = (borrowers as any[]).map(borrower => ({
          borrowerName: borrower.entityId,
          creditRating: borrower.creditRating || 'Not Rated',
          totalExposure: Number(borrower.totalExposure) || 0,
          utilization: Number(borrower.totalUtilization) || 0,
        }))

        return {
          borrowerConcentration,
        }
      }),

      // Payment metrics
      prisma.$transaction(async (tx) => {
        const now = new Date()
        const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90))

        const recentPayments = await tx.servicingActivity.findMany({
          where: {
            createdAt: {
              gte: ninetyDaysAgo,
            },
          },
          select: {
            activityType: true,
            status: true,
            amount: true,
          },
        })

        const byType = recentPayments.reduce((acc, payment) => {
          if (!acc[payment.activityType]) {
            acc[payment.activityType] = {}
          }
          if (!acc[payment.activityType][payment.status]) {
            acc[payment.activityType][payment.status] = 0
          }
          acc[payment.activityType][payment.status] += payment.amount || 0
          return acc
        }, {} as Record<string, Record<string, number>>)

        return {
          byType,
        }
      }),
    ])

    return {
      portfolio,
      loans,
      risk: borrowerRisk,
      payments,
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    throw error
  }
} 