'use server'

import { prisma } from '@/lib/prisma'

export interface AvailableLoan {
  id: string
  dealName: string
}

export async function getAvailableLoans(): Promise<AvailableLoan[]> {
  try {
    const loans = await prisma.loan.findMany({
      select: {
        id: true,
        dealName: true
      }
    })
    return loans
  } catch (error) {
    console.error('Error fetching available loans:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
} 