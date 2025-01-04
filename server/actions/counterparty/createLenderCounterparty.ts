'use server'

import { prisma } from '@/lib/prisma'

export async function createLenderCounterparty(entityId: string) {
  try {
    console.log('Creating lender counterparty for entity ID:', entityId)

    // First verify the entity exists
    const entity = await prisma.entity.findUnique({
      where: { id: entityId }
    })

    if (!entity) {
      console.error('Entity not found for ID:', entityId)
      throw new Error(`Entity not found for ID: ${entityId}`)
    }

    // Check if entity already has a counterparty
    const existingCounterparty = await prisma.counterparty.findFirst({
      where: { entityId },
      include: {
        entity: {
          select: {
            id: true,
            legalName: true,
            kyc: true
          }
        }
      }
    })

    if (existingCounterparty) {
      console.log('Found existing counterparty:', existingCounterparty)
      // If counterparty exists but no KYC, create it
      if (!existingCounterparty.entity.kyc) {
        await prisma.KYC.create({
          data: {
            entityId,
            verificationStatus: 'VERIFIED',
            counterpartyVerified: true,
            lastVerificationDate: new Date()
          }
        })
      }
      return existingCounterparty
    }

    console.log('Creating new counterparty for entity:', entityId)
    // Create a new counterparty
    const counterparty = await prisma.counterparty.create({
      data: {
        entityId,
        status: 'ACTIVE'
      },
      include: {
        entity: {
          select: {
            id: true,
            legalName: true
          }
        }
      }
    })

    // Create KYC record
    await prisma.KYC.create({
      data: {
        entityId,
        verificationStatus: 'VERIFIED',
        counterpartyVerified: true,
        lastVerificationDate: new Date()
      }
    })

    return counterparty
  } catch (error) {
    console.error('Error creating lender counterparty:', error)
    throw error instanceof Error ? error : new Error('Failed to create lender counterparty')
  }
} 