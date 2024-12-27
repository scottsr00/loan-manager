import { z } from 'zod'

export const facilityPositionStatusEnum = z.enum([
  'ACTIVE',
  'PENDING',
  'CANCELLED',
  'COMPLETED'
])

export const facilityPositionInputSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  lenderId: z.string().min(1, 'Lender ID is required'),
  amount: z.number().positive('Amount must be positive'),
  status: facilityPositionStatusEnum.default('ACTIVE')
})

export const facilityPositionUpdateSchema = z.object({
  id: z.string().min(1, 'Position ID is required'),
  amount: z.number().positive('Amount must be positive').optional(),
  status: facilityPositionStatusEnum.optional()
})

export type FacilityPositionInput = z.infer<typeof facilityPositionInputSchema>
export type FacilityPositionUpdate = z.infer<typeof facilityPositionUpdateSchema> 