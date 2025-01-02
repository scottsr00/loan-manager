'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateKYCSchema = z.object({
  entityId: z.string(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
  counterpartyVerified: z.boolean()
})

export async function updateKYCStatus(input: z.infer<typeof updateKYCSchema>) {
  const { entityId, verificationStatus, counterpartyVerified } = updateKYCSchema.parse(input)

  try {
    const kyc = await prisma.kYC.upsert({
      where: {
        entityId
      },
      update: {
        verificationStatus,
        counterpartyVerified,
        lastVerificationDate: verificationStatus === 'VERIFIED' ? new Date() : null
      },
      create: {
        entityId,
        verificationStatus,
        counterpartyVerified,
        lastVerificationDate: verificationStatus === 'VERIFIED' ? new Date() : null
      }
    })

    return kyc
  } catch (error) {
    console.error('Error updating KYC status:', error)
    throw new Error('Failed to update KYC status')
  }
} 