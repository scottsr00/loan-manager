'use server'

import { prisma } from '@/server/db/client'
import { 
  type TradeUpdate, 
  tradeUpdateSchema, 
  TradeStatus, 
  type PrismaTransaction,
  TradeActivityType,
  TransactionStatus 
} from '@/server/types/trade'
import { revalidatePath } from 'next/cache'
import type { PrismaClient, FacilityPosition, Prisma } from '@prisma/client'

type TransactionClient = Omit<
  PrismaClient, 
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

async function validateTradeConfirmation(tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      facility: true,
      buyerCounterparty: {
        include: {
          entity: true
        }
      }
    }
  })

  if (!trade) throw new Error('Trade not found')

  // Check buyer status
  if (trade.buyerCounterparty.entity.status !== 'ACTIVE') {
    throw new Error('Buyer is not active')
  }

  // Check settlement date
  if (trade.settlementDate > trade.facility.maturityDate) {
    throw new Error('Settlement date cannot be after facility maturity')
  }
}

async function validateTradeSettlement(tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      facility: true,
      sellerCounterparty: {
        include: {
          entity: true
        }
      }
    }
  })

  if (!trade) throw new Error('Trade not found')

  // Check seller position
  const sellerPosition = await prisma.facilityPosition.findFirst({
    where: {
      facilityId: trade.facilityId,
      lender: {
        entity: {
          id: trade.sellerCounterparty.entity.id
        }
      },
      status: 'ACTIVE'
    }
  })

  if (!sellerPosition || sellerPosition.amount < trade.parAmount) {
    throw new Error('Seller has insufficient position for this trade')
  }
}

async function processPositionUpdates(tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      facility: true,
      sellerCounterparty: {
        include: {
          entity: true
        }
      },
      buyerCounterparty: {
        include: {
          entity: true
        }
      }
    }
  })

  if (!trade) throw new Error('Trade not found')
  if (!trade.facility) throw new Error('Facility not found')

  await prisma.$transaction(async (tx: TransactionClient) => {
    // Get seller position
    const sellerPosition = await tx.facilityPosition.findFirst({
      where: {
        facilityId: trade.facilityId,
        lender: {
          entity: {
            id: trade.sellerCounterparty.entity.id
          }
        },
        status: 'ACTIVE'
      }
    })
    if (!sellerPosition) throw new Error('Seller position not found')

    // Calculate new seller amount
    const newSellerAmount = sellerPosition.amount - trade.parAmount
    const newSellerShare = (newSellerAmount / trade.facility.commitmentAmount) * 100

    // Update seller position
    await tx.facilityPosition.update({
      where: { id: sellerPosition.id },
      data: {
        amount: newSellerAmount,
        share: newSellerShare
      }
    })

    // Create seller position history record
    await prisma.lenderPositionHistory.create({
      data: {
        facilityId: trade.facilityId,
        lenderId: trade.sellerCounterparty.entity.id,
        changeType: 'TRADE',
        previousOutstandingAmount: sellerPosition.amount,
        newOutstandingAmount: newSellerAmount,
        previousAccruedInterest: 0, // TODO: Track accrued interest
        newAccruedInterest: 0,
        changeAmount: -trade.parAmount,
        userId: 'SYSTEM',
        notes: `Sold ${formatAmount(trade.parAmount)} at ${trade.price.toFixed(2)}%`,
        activityType: 'TRADE',
        tradeId: trade.id
      }
    })

    // Get or create buyer position
    let buyerPosition = await tx.facilityPosition.findFirst({
      where: {
        facilityId: trade.facilityId,
        lender: {
          entity: {
            id: trade.buyerCounterparty.entity.id
          }
        },
        status: 'ACTIVE'
      }
    })

    let previousBuyerAmount = 0
    if (buyerPosition) {
      previousBuyerAmount = buyerPosition.amount
      const newBuyerAmount = buyerPosition.amount + trade.parAmount
      const newBuyerShare = (newBuyerAmount / trade.facility.commitmentAmount) * 100

      buyerPosition = await tx.facilityPosition.update({
        where: { id: buyerPosition.id },
        data: {
          amount: newBuyerAmount,
          share: newBuyerShare
        }
      })
    } else {
      const newBuyerShare = (trade.parAmount / trade.facility.commitmentAmount) * 100
      buyerPosition = await tx.facilityPosition.create({
        data: {
          facility: {
            connect: {
              id: trade.facilityId
            }
          },
          lender: {
            connect: {
              entityId: trade.buyerCounterparty.entity.id
            }
          },
          amount: trade.parAmount,
          share: newBuyerShare,
          status: 'ACTIVE'
        }
      })
    }

    // Create buyer position history record
    await prisma.lenderPositionHistory.create({
      data: {
        facilityId: trade.facilityId,
        lenderId: trade.buyerCounterparty.entity.id,
        changeType: 'TRADE',
        previousOutstandingAmount: previousBuyerAmount,
        newOutstandingAmount: buyerPosition.amount,
        previousAccruedInterest: 0, // TODO: Track accrued interest
        newAccruedInterest: 0,
        changeAmount: trade.parAmount,
        userId: 'SYSTEM',
        notes: `Bought ${formatAmount(trade.parAmount)} at ${trade.price.toFixed(2)}%`,
        activityType: 'TRADE',
        tradeId: trade.id
      }
    })
  })
}

export async function updateTradeStatus(input: TradeUpdate) {
  try {
    const validatedData = tradeUpdateSchema.parse(input)
    const { id, status, description } = validatedData

    const currentTrade = await prisma.trade.findUnique({
      where: { id }
    })

    if (!currentTrade) {
      throw new Error('Trade not found')
    }

    // Validate status transition
    switch (status) {
      case TradeStatus.CONFIRMED:
        if (currentTrade.status !== TradeStatus.PENDING) {
          throw new Error('Trade must be in PENDING status to confirm')
        }
        await validateTradeConfirmation(id)
        break

      case TradeStatus.SETTLED:
        if (currentTrade.status !== TradeStatus.CONFIRMED) {
          throw new Error('Trade must be in CONFIRMED status to settle')
        }
        await validateTradeSettlement(id)
        break

      case TradeStatus.CLOSED:
        if (currentTrade.status !== TradeStatus.SETTLED) {
          throw new Error('Trade must be in SETTLED status to close')
        }
        await processPositionUpdates(id)
        break
    }

    // Update trade status
    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        status,
        transactions: {
          create: {
            activityType: `TRADE_${status}` as keyof typeof TradeActivityType,
            amount: currentTrade.parAmount,
            status: TransactionStatus.COMPLETED,
            description: description || `Trade status updated to ${status}`,
            effectiveDate: new Date(),
            processedBy: 'SYSTEM'
          }
        }
      },
      include: {
        facility: {
          include: {
            creditAgreement: true
          }
        },
        sellerCounterparty: {
          include: {
            entity: true
          }
        },
        buyerCounterparty: {
          include: {
            entity: true
          }
        },
        transactions: true
      }
    })

    revalidatePath('/trades')
    return updatedTrade
  } catch (error) {
    console.error('Error in updateTradeStatus:', error)
    throw error instanceof Error ? error : new Error('Failed to update trade status')
  }
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
} 