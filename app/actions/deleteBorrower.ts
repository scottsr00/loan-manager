'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function deleteBorrower(id: string): Promise<void> {
  try {
    // First check if the borrower exists and has no credit agreements
    const borrower = await prisma.borrower.findUnique({
      where: { id },
      include: {
        creditAgreements: true
      }
    })

    if (!borrower) {
      throw new Error('Borrower not found')
    }

    if (borrower.creditAgreements.length > 0) {
      throw new Error('Cannot delete borrower with active credit agreements')
    }

    // Delete all related records in a transaction
    await prisma.$transaction([
      // Delete all borrower covenants
      prisma.borrowerCovenant.deleteMany({
        where: { borrowerId: id }
      }),
      // Delete all financial statements
      prisma.borrowerFinancialStatement.deleteMany({
        where: { borrowerId: id }
      }),
      // Delete all required documents
      prisma.borrowerRequiredDocument.deleteMany({
        where: { borrowerId: id }
      }),
      // Delete the borrower record
      prisma.borrower.delete({
        where: { id }
      })
    ])
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        throw new Error('Cannot delete borrower due to existing relationships')
      }
    }
    console.error('Error in deleteBorrower:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to delete borrower')
  }
} 