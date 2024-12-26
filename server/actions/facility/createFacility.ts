'use server'

import { prisma } from '@/server/db/client'

interface CreateFacilityInput {
  creditAgreementId: string
  facilityName: string
  facilityType: string
  commitmentAmount: number
  currency?: string
  startDate: Date
  maturityDate: Date
  interestType: string
  baseRate: string
  margin: number
  description?: string
  sublimits?: {
    type: string
    amount: number
    description?: string
  }[]
}

export async function createFacility(data: CreateFacilityInput) {
  try {
    // Validate required fields
    if (!data.creditAgreementId) {
      throw new Error('Credit Agreement ID is required')
    }
    if (!data.facilityName) {
      throw new Error('Facility name is required')
    }
    if (!data.facilityType) {
      throw new Error('Facility type is required')
    }
    if (data.commitmentAmount <= 0) {
      throw new Error('Commitment amount must be positive')
    }
    if (!data.startDate || !data.maturityDate) {
      throw new Error('Start date and maturity date are required')
    }
    if (data.maturityDate <= data.startDate) {
      throw new Error('Maturity date must be after start date')
    }

    // Validate sublimits
    if (data.sublimits) {
      for (const sublimit of data.sublimits) {
        if (sublimit.amount <= 0) {
          throw new Error('Sublimit amount must be positive')
        }
        if (sublimit.amount > data.commitmentAmount) {
          throw new Error('Sublimit amount cannot exceed commitment amount')
        }
      }
    }

    // Create the facility
    const facility = await prisma.facility.create({
      data: {
        creditAgreementId: data.creditAgreementId,
        facilityName: data.facilityName,
        facilityType: data.facilityType,
        commitmentAmount: data.commitmentAmount,
        currency: data.currency || 'USD',
        startDate: data.startDate,
        maturityDate: data.maturityDate,
        interestType: data.interestType,
        baseRate: data.baseRate,
        margin: data.margin,
        description: data.description,
        sublimits: data.sublimits ? {
          create: data.sublimits.map(sublimit => ({
            type: sublimit.type,
            amount: sublimit.amount,
            description: sublimit.description,
          }))
        } : undefined,
      },
      include: {
        sublimits: true,
        creditAgreement: true,
      },
    })

    return facility
  } catch (error) {
    console.error('Error creating facility:', error)
    throw error instanceof Error ? error : new Error('Failed to create facility')
  }
} 