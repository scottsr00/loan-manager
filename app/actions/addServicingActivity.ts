'use server'

import { prisma } from '@/lib/prisma'

interface AddServicingActivityParams {
  loanId: string
  activityType: string
  status: string
  dueDate: Date
  description: string
  amount?: number
  rateChange?: number
  assignedTo?: string
  priority: string
}

export async function addServicingActivity(params: AddServicingActivityParams) {
  if (!params.loanId || !params.activityType || !params.status || !params.dueDate || !params.description || !params.priority) {
    throw new Error('Missing required parameters')
  }

  try {
    const activity = await prisma.servicingActivity.create({
      data: {
        loanId: params.loanId,
        activityType: params.activityType,
        status: params.status,
        dueDate: params.dueDate,
        description: params.description,
        amount: params.amount,
        rateChange: params.rateChange,
        assignedTo: params.assignedTo,
        priority: params.priority
      },
      include: {
        loan: {
          select: {
            dealName: true
          }
        }
      }
    })

    return {
      success: true,
      activity: {
        ...activity,
        dealName: activity.loan.dealName
      }
    }
  } catch (error) {
    console.error('Error adding servicing activity:', error)
    throw new Error('Failed to add servicing activity')
  }
} 