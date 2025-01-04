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
        availableAmount: data.commitmentAmount,
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
        creditAgreement: {
          include: {
            lender: {
              include: {
                lender: true
              }
            }
          }
        },
      },
    })

    // Get the lender ID first
    const lender = await prisma.lender.findFirst({
      where: {
        entityId: facility.creditAgreement.lender.id
      }
    })

    if (!lender) {
      throw new Error('Lender not found')
    }

    // Create initial position for the agent lender
    await prisma.facilityPosition.create({
      data: {
        facilityId: facility.id,
        lenderId: lender.id,  // Use the actual Lender ID
        commitmentAmount: data.commitmentAmount,
        undrawnAmount: data.commitmentAmount,
        drawnAmount: 0,
        share: 100,  // 100% since it's the only lender
        status: 'ACTIVE'
      }
    })

    return facility
  } catch (error) {
    console.error('Error creating facility:', error)
    throw error instanceof Error ? error : new Error('Failed to create facility')
  }
} 