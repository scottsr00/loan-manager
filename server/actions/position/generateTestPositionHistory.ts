'use server'

import { prisma } from '@/server/db/client'
import { PositionChangeType } from '@prisma/client'

export async function generateTestPositionHistory(facilityId: string) {
  try {
    // Get the facility with its positions
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
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
    })

    if (!facility) {
      throw new Error('Facility not found')
    }

    // For each position, create some test history records
    const now = new Date()
    const historyRecords = []

    for (const position of facility.positions) {
      const lenderId = position.lender.entity.id
      const baseAmount = position.amount

      // Create a series of test records over the past month
      for (let i = 0; i < 5; i++) {
        const date = new Date(now)
        date.setDate(date.getDate() - (i * 7)) // One record per week

        // Alternate between different types of changes
        const changeType = i % 3 === 0 ? 'PAYDOWN' : i % 3 === 1 ? 'ACCRUAL' : 'TRADE'
        const changeAmount = changeType === 'PAYDOWN' ? baseAmount * 0.1 : 
                           changeType === 'ACCRUAL' ? baseAmount * 0.02 : 
                           baseAmount * 0.15

        const previousOutstanding = baseAmount - (i * changeAmount)
        const newOutstanding = previousOutstanding - (changeType === 'PAYDOWN' ? changeAmount : 0)
        const previousAccrued = baseAmount * 0.05 * (i / 10)
        const newAccrued = previousAccrued + (changeType === 'ACCRUAL' ? changeAmount : 0)

        historyRecords.push({
          facilityId,
          lenderId,
          changeDateTime: date,
          changeType: changeType as PositionChangeType,
          previousOutstandingAmount: previousOutstanding,
          newOutstandingAmount: newOutstanding,
          previousAccruedInterest: previousAccrued,
          newAccruedInterest: newAccrued,
          changeAmount,
          userId: 'SYSTEM',
          notes: `Test ${changeType.toLowerCase()} record`
        })
      }
    }

    // Create all history records
    await prisma.lenderPositionHistory.createMany({
      data: historyRecords
    })

    return { success: true, count: historyRecords.length }
  } catch (error) {
    console.error('Error generating test position history:', error)
    throw new Error('Failed to generate test position history')
  }
} 