import { z } from 'zod'

export const KYCStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
} as const

export const kycSchema = z.object({
  entityId: z.string(),
  verificationStatus: z.enum([
    KYCStatus.PENDING,
    KYCStatus.VERIFIED,
    KYCStatus.REJECTED
  ]),
  lenderVerified: z.boolean(),
  counterpartyVerified: z.boolean(),
  lastVerificationDate: z.date().optional()
})

export type KYC = {
  id: string
  entityId: string
  verificationStatus: keyof typeof KYCStatus
  lenderVerified: boolean
  counterpartyVerified: boolean
  lastVerificationDate: Date | null
  createdAt: Date
  updatedAt: Date
}

export type KYCWithEntity = KYC & {
  entity: {
    legalName: string
    status: string
  }
} 