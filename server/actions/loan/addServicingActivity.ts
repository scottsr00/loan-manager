'use server'

import { prisma } from '@/server/db/client'
import { type ServicingActivityInput } from '@/server/types'

const VALID_ACTIVITY_TYPES = [
  'Payment',
  'Documentation',
  'Compliance',
  'Credit Review',
  'Amendment',
  'Other'
] as const

type ActivityType = typeof VALID_ACTIVITY_TYPES[number]

function validateInput(input: ServicingActivityInput): void {
  if (!input.loanId) {
    throw new Error('Loan ID is required')
  }

  if (!VALID_ACTIVITY_TYPES.includes(input.activityType as ActivityType)) {
    throw new Error('Invalid activity type')
  }

  if (!input.description || input.description.trim().length === 0) {
    throw new Error('Description is required')
  }

  if (!input.dueDate || isNaN(new Date(input.dueDate).getTime())) {
    throw new Error('Valid due date is required')
  }

  if (!input.assignedTo || input.assignedTo.trim().length === 0) {
    throw new Error('Assigned to is required')
  }
}

export async function addServicingActivity(data: ServicingActivityInput) {
  try {
    validateInput(data)

    // Check if loan exists
    const loan = await prisma.loan.findUnique({
      where: { id: data.loanId }
    })

    if (!loan) {
      throw new Error('Loan not found')
    }

    const activity = await prisma.servicingActivity.create({
      data: {
        ...data,
        status: 'Open'
      },
      include: {
        loan: {
          select: {
            dealName: true,
            currentBalance: true,
            agentBank: true
          }
        }
      }
    })

    return activity
  } catch (error) {
    console.error('Error in addServicingActivity:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create servicing activity')
  }
} 