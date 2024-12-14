'use server'

import { prisma } from '@/lib/prisma'

export async function getAnalytics() {
  try {
    // Fetch all credit agreements with facilities
    const creditAgreements = await prisma.creditAgreement.findMany({
      include: {
        borrower: {
          include: {
            entity: true,
            financialStatements: true,
          }
        },
        facilities: true,
      },
      orderBy: {
        effectiveDate: 'desc',
      },
    })

    // Calculate total commitment by month
    const commitmentByMonth = creditAgreements.reduce((acc, agreement) => {
      const date = agreement.effectiveDate.toISOString().split('T')[0].substring(0, 7) // YYYY-MM
      const totalCommitment = agreement.facilities.reduce((sum, facility) => sum + facility.commitmentAmount, 0)
      
      const existingEntry = acc.find(entry => entry.date === date)
      if (existingEntry) {
        existingEntry.volume += totalCommitment
      } else {
        acc.push({ date, volume: totalCommitment })
      }
      return acc
    }, [] as { date: string; volume: number }[])

    // Calculate facilities by type
    const facilitiesByType = creditAgreements.flatMap(a => a.facilities).reduce((acc, facility) => {
      const type = facility.facilityType
      const existingEntry = acc.find(entry => entry.type === type)
      if (existingEntry) {
        existingEntry.amount += facility.commitmentAmount
      } else {
        acc.push({ type, amount: facility.commitmentAmount })
      }
      return acc
    }, [] as { type: string; amount: number }[])

    // Calculate commitments by borrower
    const commitmentsByBorrower = creditAgreements.reduce((acc, agreement) => {
      const borrowerName = agreement.borrower.entity.legalName
      const totalCommitment = agreement.facilities.reduce((sum, facility) => sum + facility.commitmentAmount, 0)
      
      const existingEntry = acc.find(entry => entry.borrowerName === borrowerName)
      if (existingEntry) {
        existingEntry.commitment += totalCommitment
      } else {
        acc.push({ borrowerName, commitment: totalCommitment })
      }
      return acc
    }, [] as { borrowerName: string; commitment: number }[])

    // Calculate credit metrics
    const creditMetrics = creditAgreements.map(agreement => {
      const latestFinancials = agreement.borrower.financialStatements[0]
      return {
        borrowerName: agreement.borrower.entity.legalName,
        creditRating: agreement.borrower.creditRating || 'Not Rated',
        totalAssets: latestFinancials?.totalAssets || 0,
        totalLiabilities: latestFinancials?.totalLiabilities || 0,
        netWorth: latestFinancials?.totalEquity || 0,
        totalCommitment: agreement.facilities.reduce((sum, facility) => sum + facility.commitmentAmount, 0),
      }
    })

    // Calculate interest income projection
    const today = new Date()
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const interestProjection = Array.from(
      { length: endOfMonth.getDate() - today.getDate() + 1 },
      (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        
        // Calculate projected interest for all facilities
        const dailyInterest = creditAgreements.reduce((total, agreement) => {
          return total + agreement.facilities.reduce((facilityTotal, facility) => {
            // Simple interest calculation (can be made more sophisticated)
            const dailyRate = (facility.margin / 100) / 360
            return facilityTotal + (facility.commitmentAmount * dailyRate)
          }, 0)
        }, 0)

        return {
          date: date.toISOString().split('T')[0],
          amount: dailyInterest
        }
      }
    )

    return {
      commitmentByMonth,
      facilitiesByType,
      commitmentsByBorrower,
      creditMetrics,
      interestProjection,
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    throw error
  }
} 