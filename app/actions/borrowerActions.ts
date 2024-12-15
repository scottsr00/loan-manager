'use server'

import { prisma } from '@/lib/prisma'
import type { Borrower } from '@/components/borrowers/columns'

export async function getBorrowers(): Promise<Borrower[]> {
  try {
    const borrowers = await prisma.borrower.findMany({
      include: {
        entity: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return borrowers
  } catch (error) {
    console.error('Error in getBorrowers:', error)
    throw new Error('Failed to fetch borrowers')
  }
}

export async function createBorrower(data: Partial<Borrower>) {
  try {
    const borrower = await prisma.borrower.create({
      data: {
        ...data,
        entity: {
          connect: { id: data.entityId! }
        }
      },
      include: {
        entity: true,
      },
    })
    return borrower
  } catch (error) {
    console.error('Error in createBorrower:', error)
    throw new Error('Failed to create borrower')
  }
}

export async function deleteBorrower(id: string) {
  try {
    await prisma.borrower.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Error in deleteBorrower:', error)
    throw new Error('Failed to delete borrower')
  }
} 