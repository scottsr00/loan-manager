import { z } from 'zod'

// Database schema type
export interface FacilityPosition {
  id: string
  facilityId: string
  lenderId: string
  commitmentAmount: number
  undrawnAmount: number
  drawnAmount: number
  share: number
  status: FacilityPositionStatus
  createdAt: Date
  updatedAt: Date
}

// Status enum
export const FacilityPositionStatus = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
} as const

export type FacilityPositionStatus = typeof FacilityPositionStatus[keyof typeof FacilityPositionStatus]

// Database type with loaded relations
export interface FacilityPositionWithRelations extends FacilityPosition {
  lender: {
    id: string
    entityId: string
    entity: {
      id: string
      legalName: string
    }
  }
  facility: {
    id: string
    facilityName: string
    creditAgreement?: {
      agreementNumber: string
      borrower: {
        name: string
        type?: string
        status: string
      }
      lender: {
        legalName: string
        isAgent?: boolean
      }
    }
  }
}

// UI view model (simplified for display)
export interface FacilityPositionView {
  id: string
  lenderName: string
  lenderId: string
  facilityName: string
  facilityId: string
  commitmentAmount: number
  drawnAmount: number
  undrawnAmount: number
  share: number
  status: FacilityPositionStatus
  hierarchyInfo?: {
    agreementNumber: string
    borrowerName: string
    borrowerType?: string
    borrowerStatus: string
    agentName: string
    isAgent?: boolean
  }
}

// Hierarchy view for position display
export interface FacilityPositionHierarchyView {
  id: string
  agreementNumber: string
  borrower: {
    name: string
    type?: string
    status: string
  }
  agent: {
    name: string
    type?: string
    isAgent: boolean
  }
  amount: number
  currency: string
  status: string
  interestRate: number
  facilities: {
    id: string
    facilityName: string
    facilityType: string
    commitmentAmount: number
    currency: string
    status: string
    interestType: string
    baseRate: string
    margin: number
    positions: FacilityPositionView[]
    trades?: {
      id: string
      counterparty: string
      amount: number
      price: number
      status: string
      tradeDate: Date
      settlementDate: Date
    }[]
    loans?: {
      id: string
      amount: number
      outstandingAmount: number
      currency: string
      status: string
      interestPeriod: string
      drawDate: Date
      baseRate: string
      effectiveRate: string
    }[]
    servicingActivities?: {
      id: string
      activityType: string
      dueDate: Date
      description: string | null
      amount: number
      status: string
      completedAt: Date | null
      completedBy: string | null
    }[]
  }[]
}

// Server Action input validation
export const facilityPositionInputSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  lenderId: z.string().min(1, 'Lender ID is required'),
  commitmentAmount: z.number().positive('Commitment amount must be positive'),
  share: z.number().min(0, 'Share must be non-negative').max(100, 'Share cannot exceed 100%'),
  status: z.enum(Object.values(FacilityPositionStatus) as [string, ...string[]]).default('ACTIVE')
})

// Server Action update validation
export const facilityPositionUpdateSchema = z.object({
  id: z.string().min(1, 'Position ID is required'),
  commitmentAmount: z.number().positive('Commitment amount must be positive').optional(),
  share: z.number().min(0, 'Share must be non-negative').max(100, 'Share cannot exceed 100%').optional(),
  status: z.enum(Object.values(FacilityPositionStatus) as [string, ...string[]]).optional()
})

export type FacilityPositionInput = z.infer<typeof facilityPositionInputSchema>
export type FacilityPositionUpdate = z.infer<typeof facilityPositionUpdateSchema> 