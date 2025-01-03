'use server'

import { prisma } from '@/server/db/client'

interface GetServicingActivitiesParams {
  status?: string
  activityType?: string
  facilityId?: string
  startDate?: Date
  endDate?: Date
}

interface Loan {
  id: string
  status: string
  outstandingAmount: number
}

interface Activity {
  id: string
  activityType: string
  facility?: {
    loans: Loan[]
  }
}

export async function getServicingActivities(params: GetServicingActivitiesParams = {}) {
  try {
    const { status, activityType, facilityId, startDate, endDate } = params

    const where = {
      ...(status && { status }),
      ...(activityType && { activityType }),
      ...(facilityId && { facilityId }),
      ...(startDate && endDate && {
        dueDate: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    // First, get all servicing activities with their facilities
    const activities = await prisma.servicingActivity.findMany({
      where,
      include: {
        facility: {
          include: {
            creditAgreement: true,
            loans: {
              where: {
                status: 'ACTIVE'
              },
              select: {
                id: true,
                status: true,
                outstandingAmount: true
              }
            }
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      }
    })

    return {
      activities: activities.map((activity: Activity) => {
        const { facility, ...rest } = activity
        const activeLoans = facility?.loans || []
        const totalOutstanding = activeLoans.reduce((sum: number, loan: Loan) => sum + loan.outstandingAmount, 0)

        // For payment activities, include all active loans with their proportional amounts
        if (['PRINCIPAL_PAYMENT', 'INTEREST_PAYMENT', 'UNSCHEDULED_PAYMENT', 'DRAWDOWN'].includes(activity.activityType)) {
          return {
            ...rest,
            facility,
            facilityOutstandingAmount: totalOutstanding,
            loans: activeLoans.map((loan: Loan) => ({
              id: loan.id,
              status: loan.status,
              outstandingAmount: loan.outstandingAmount,
              // Calculate the proportional share of the payment for each loan
              paymentShare: totalOutstanding > 0 
                ? (loan.outstandingAmount / totalOutstanding) * (activity as any).amount 
                : 0
            }))
          }
        }

        return {
          ...rest,
          facility,
          facilityOutstandingAmount: totalOutstanding
        }
      })
    }
  } catch (error) {
    console.error('Error in getServicingActivities:', error)
    throw new Error('Failed to fetch servicing activities')
  }
} 