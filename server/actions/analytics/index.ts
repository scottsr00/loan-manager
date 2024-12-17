'use server'

import { db } from '@/server/db'
import { format, startOfMonth, subMonths } from 'date-fns'

export async function getAnalytics() {
  try {
    // Get all credit agreements with related data
    const creditAgreements = await db.creditAgreement.findMany({
      include: {
        borrower: true,
        lender: true,
        facilities: {
          include: {
            trades: {
              include: {
                counterparty: true,
                historicalBalances: true
              }
            }
          }
        }
      }
    })

    if (!creditAgreements || creditAgreements.length === 0) {
      return {
        commitmentByMonth: [],
        facilitiesByType: [],
        commitmentsByBorrower: [],
        creditMetrics: [],
        interestProjection: []
      }
    }

    // Calculate commitment by month for the last 12 months
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = startOfMonth(subMonths(new Date(), i))
      return format(date, 'yyyy-MM')
    }).reverse()

    const commitmentByMonth = last12Months.map(monthStr => {
      const totalCommitment = creditAgreements.reduce((sum, agreement) => {
        const agreementDate = format(new Date(agreement.startDate), 'yyyy-MM')
        if (agreementDate <= monthStr) {
          sum += agreement.amount
        }
        return sum
      }, 0)

      return {
        date: monthStr,
        volume: totalCommitment
      }
    })

    // Calculate facilities by type
    const facilitiesByType = creditAgreements.reduce((acc, agreement) => {
      agreement.facilities.forEach(facility => {
        const existingType = acc.find(item => item.type === facility.facilityType)
        if (existingType) {
          existingType.amount += facility.commitmentAmount
        } else {
          acc.push({
            type: facility.facilityType,
            amount: facility.commitmentAmount
          })
        }
      })
      return acc
    }, [] as { type: string; amount: number }[])

    // Calculate commitments by borrower
    const commitmentsByBorrower = creditAgreements.map(agreement => ({
      borrowerName: agreement.borrower.name,
      commitment: agreement.amount
    }))

    // Compile credit metrics
    const creditMetrics = creditAgreements.map(agreement => ({
      borrowerName: agreement.borrower.name,
      creditRating: 'N/A', // Not in current schema
      totalAssets: 0, // Not in current schema
      totalLiabilities: 0, // Not in current schema
      totalEquity: 0, // Not in current schema
      totalCommitment: agreement.amount
    }))

    // Calculate projected interest income for next 12 months
    const interestProjection = last12Months.map(monthStr => {
      const projectedInterest = creditAgreements.reduce((sum, agreement) => {
        const annualRate = agreement.interestRate / 100
        const monthlyRate = annualRate / 12
        return sum + (agreement.amount * monthlyRate)
      }, 0)

      return {
        date: monthStr,
        amount: projectedInterest
      }
    })

    return {
      commitmentByMonth,
      facilitiesByType,
      commitmentsByBorrower,
      creditMetrics,
      interestProjection
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return {
      commitmentByMonth: [],
      facilitiesByType: [],
      commitmentsByBorrower: [],
      creditMetrics: [],
      interestProjection: []
    }
  }
} 