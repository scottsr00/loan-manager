'use server'

import { prisma } from '@/lib/prisma'

export async function checkKYCStatus(entityId: string) {
  try {
    const kyc = await prisma.kYC.findUnique({
      where: { entityId },
      select: {
        verificationStatus: true,
        lenderVerified: true,
        counterpartyVerified: true
      }
    })

    return {
      canTrade: kyc?.verificationStatus === 'VERIFIED' && kyc?.counterpartyVerified,
      canBeLender: kyc?.verificationStatus === 'VERIFIED' && kyc?.lenderVerified
    }
  } catch (error) {
    console.error('Error checking KYC status:', error)
    throw new Error('Failed to check KYC status')
  }
} 