'use server'

import { prisma } from '@/lib/prisma'
import { validateCounterpartyKYC } from './validateCounterpartyKYC'
import { TradeInput } from '@/server/types/trade'

export async function validateTrade(trade: TradeInput): Promise<{
  isValid: boolean;
  message?: string;
}> {
  try {
    // Validate seller KYC
    const sellerKYC = await validateCounterpartyKYC(trade.sellerCounterpartyId)
    if (!sellerKYC.isValid) {
      return {
        isValid: false,
        message: `Seller KYC validation failed: ${sellerKYC.message}`
      }
    }

    // Validate buyer KYC
    const buyerKYC = await validateCounterpartyKYC(trade.buyerCounterpartyId)
    if (!buyerKYC.isValid) {
      return {
        isValid: false,
        message: `Buyer KYC validation failed: ${buyerKYC.message}`
      }
    }

    // Validate facility exists and is active
    const facility = await prisma.facility.findUnique({
      where: { id: trade.facilityId },
      include: {
        creditAgreement: true
      }
    })

    if (!facility) {
      return {
        isValid: false,
        message: "Facility not found"
      }
    }

    if (facility.status !== "ACTIVE") {
      return {
        isValid: false,
        message: "Facility is not active"
      }
    }

    // Validate trade amount is within facility limits
    if (trade.parAmount <= 0) {
      return {
        isValid: false,
        message: "Trade amount must be greater than 0"
      }
    }

    if (trade.parAmount > facility.commitmentAmount) {
      return {
        isValid: false,
        message: "Trade amount exceeds facility commitment amount"
      }
    }

    // Validate seller has sufficient position
    const sellerPosition = await prisma.facilityPosition.findFirst({
      where: {
        facilityId: trade.facilityId,
        lender: {
          entity: {
            counterparty: {
              id: trade.sellerCounterpartyId
            }
          }
        }
      }
    })

    if (!sellerPosition || sellerPosition.amount < trade.parAmount) {
      return {
        isValid: false,
        message: "Seller has insufficient position for this trade"
      }
    }

    // Validate settlement date
    const settlementDate = new Date(trade.settlementDate)
    const today = new Date()
    const maturityDate = new Date(facility.maturityDate)

    if (settlementDate < today) {
      return {
        isValid: false,
        message: "Settlement date cannot be in the past"
      }
    }

    if (settlementDate > maturityDate) {
      return {
        isValid: false,
        message: "Settlement date cannot be after facility maturity date"
      }
    }

    return {
      isValid: true
    }
  } catch (error) {
    console.error("Error validating trade:", error)
    return {
      isValid: false,
      message: "Error validating trade"
    }
  }
} 