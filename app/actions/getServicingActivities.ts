'use server'

import { prisma } from '@/lib/prisma'

export interface ServicingActivity {
  id: number
  loanId: string
  dealName: string
  activityType: string
  status: string
  dueDate: Date
  completedDate?: Date
  description: string
  amount?: number
  rateChange?: number
  assignedTo?: string
  priority: string
  createdAt: Date
  updatedAt: Date
}

export async function getServicingActivities(filters?: {
  status?: string
  priority?: string
  activityType?: string
  loanId?: string
}): Promise<ServicingActivity[]> {
  try {
    const activities = await prisma.servicingActivity.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.priority && { priority: filters.priority }),
        ...(filters?.activityType && { activityType: filters.activityType }),
        ...(filters?.loanId && { loanId: filters.loanId }),
      },
      include: {
        loan: {
          select: {
            dealName: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' }
      ]
    })

    return activities.map(activity => ({
      ...activity,
      dealName: activity.loan.dealName
    }))
  } catch (error) {
    console.error('Error fetching servicing activities:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
} 