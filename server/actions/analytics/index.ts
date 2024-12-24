'use server'

import { prisma } from '@/server/db/client'
import type { Loan, Borrower, Entity } from '@prisma/client'

interface BorrowerWithEntity extends Borrower {
  entity: Entity
}

export async function getAnalytics() {
  try {
    // Get commitment by month
    const commitmentByMonth = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        SUM(amount) as total
      FROM Loan
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `

    // Get facilities by type
    const facilitiesByType = await prisma.$queryRaw`
      SELECT 
        type,
        COUNT(*) as count
      FROM FacilitySublimit
      GROUP BY type
    `

    // Get commitments by borrower
    const borrowers = await prisma.borrower.findMany({
      include: {
        entity: true
      }
    }) as BorrowerWithEntity[]

    // Get all loans with their relationships
    const loans = await prisma.loan.findMany({
      include: {
        facility: {
          include: {
            creditAgreement: {
              include: {
                borrower: true
              }
            }
          }
        }
      }
    })

    // Group loans by borrower
    const loansByBorrower = loans.reduce((acc, loan) => {
      const borrowerId = loan.facility.creditAgreement.borrower.id
      if (!acc[borrowerId]) {
        acc[borrowerId] = []
      }
      acc[borrowerId].push(loan)
      return acc
    }, {} as Record<string, Loan[]>)

    const commitmentsByBorrower = borrowers.map(borrower => ({
      borrowerName: borrower.entity.legalName,
      commitment: (loansByBorrower[borrower.id] || []).reduce((sum, loan) => sum + loan.amount, 0)
    }))

    // Get credit metrics
    const creditMetrics = borrowers.map(borrower => ({
      borrowerName: borrower.entity.legalName,
      creditRating: borrower.creditRating || 'N/A',
      totalCommitment: (loansByBorrower[borrower.id] || []).reduce((sum, loan) => sum + loan.amount, 0)
    }))

    // Calculate interest projection (simplified)
    const interestProjection = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      return {
        date: date.toISOString().slice(0, 7), // YYYY-MM format
        amount: 0 // Placeholder - would need actual interest rate data
      }
    })

    return {
      commitmentByMonth: commitmentByMonth || [],
      facilitiesByType: facilitiesByType || [],
      commitmentsByBorrower,
      creditMetrics,
      interestProjection
    }
  } catch (error) {
    console.error('Error fetching analytics:', error instanceof Error ? error.message : 'Unknown error')
    return {
      commitmentByMonth: [],
      facilitiesByType: [],
      commitmentsByBorrower: [],
      creditMetrics: [],
      interestProjection: []
    }
  }
} 