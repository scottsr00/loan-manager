'use server'

import { prisma } from '@/server/db/client'
import { type Facility, type Entity } from '@prisma/client'

interface FacilityWithRelations extends Facility {
  creditAgreement: {
    borrower: Entity | null
    lender: Entity | null
  } | null
  servicingActivities: any[]
  trades: any[]
  loans: {
    outstandingAmount: number | null
  }[]
}

export async function getFacilities() {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        creditAgreement: {
          include: {
            borrower: true,
            lender: true
          }
        },
        servicingActivities: {
          orderBy: {
            dueDate: 'desc'
          }
        },
        trades: {
          orderBy: {
            tradeDate: 'desc'
          }
        },
        loans: {
          select: {
            outstandingAmount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const validFacilities = facilities
      .filter((f: FacilityWithRelations) => f.creditAgreement?.borrower && f.creditAgreement?.lender)
      .map((facility: FacilityWithRelations) => {
        const totalOutstanding = facility.loans.reduce((sum, loan) => {
          const amount = loan.outstandingAmount || 0
          return sum + amount
        }, 0)
        
        return {
          ...facility,
          availableAmount: facility.commitmentAmount - totalOutstanding
        }
      })

    console.log('Fetched facilities with activities:', 
      validFacilities.map((f: FacilityWithRelations) => ({
        id: f.id,
        name: f.facilityName,
        servicingCount: f.servicingActivities?.length || 0,
        tradesCount: f.trades?.length || 0
      }))
    )

    return validFacilities
  } catch (error) {
    console.error('Error in getFacilities:', error instanceof Error ? error.message : 'Unknown error')
    // Return empty array for database errors
    return []
  }
} 
