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

async function validateTradeConfirmation(tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      facility: true,
      buyer: true
    }
  })

  if (!trade) throw new Error('Trade not found')

  // Check buyer status
  if (trade.buyer.status !== 'ACTIVE') {
    throw new Error('Buyer is not an active lender')
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
      facility: true
    }
  })

  if (!trade) throw new Error('Trade not found')

  // Check seller position
  const sellerPosition = await prisma.facilityPosition.findFirst({
    where: {
      facilityId: trade.facilityId,
      lenderId: trade.sellerLenderId,
      status: 'ACTIVE'
    }
  })

  if (!sellerPosition || sellerPosition.amount < trade.parAmount) {
    throw new Error('Seller has insufficient position for this trade')
  }
}

async function updatePositions(tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      facility: true
    }
  })

  if (!trade) throw new Error('Trade not found')

  await prisma.$transaction(async (tx: PrismaTransaction) => {
    // Get total facility commitment for share calculation
    const facility = await tx.facility.findUnique({
      where: { id: trade.facilityId }
    })
    if (!facility) throw new Error('Facility not found')

    // Update seller position
    const sellerPosition = await tx.facilityPosition.findFirst({
      where: {
        facilityId: trade.facilityId,
        lenderId: trade.sellerLenderId,
        status: 'ACTIVE'
      }
    })
    if (!sellerPosition) throw new Error('Seller position not found')

    const newSellerAmount = sellerPosition.amount - trade.parAmount
    const newSellerShare = (newSellerAmount / facility.commitmentAmount) * 100

    await tx.facilityPosition.update({
      where: { id: sellerPosition.id },
      data: {
        amount: newSellerAmount,
        share: newSellerShare
      }
    })

    // Create transaction for seller position update
    await tx.transactionHistory.create({
      data: {
        tradeId: trade.id,
        activityType: TradeActivityType.POSITION_UPDATED,
        amount: -trade.parAmount,
        status: TransactionStatus.COMPLETED,
        description: `Seller position reduced by ${trade.parAmount}`,
        effectiveDate: new Date(),
        processedBy: 'SYSTEM'
      }
    })

    // Update or create buyer position
    const buyerPosition = await tx.facilityPosition.findFirst({
      where: {
        facilityId: trade.facilityId,
        lenderId: trade.buyerLenderId,
        status: 'ACTIVE'
      }
    })

    if (buyerPosition) {
      const newBuyerAmount = buyerPosition.amount + trade.parAmount
      const newBuyerShare = (newBuyerAmount / facility.commitmentAmount) * 100

      await tx.facilityPosition.update({
        where: { id: buyerPosition.id },
        data: {
          amount: newBuyerAmount,
          share: newBuyerShare
        }
      })
    } else {
      const newBuyerShare = (trade.parAmount / facility.commitmentAmount) * 100
      await tx.facilityPosition.create({
        data: {
          facilityId: trade.facilityId,
          lenderId: trade.buyerLenderId,
          amount: trade.parAmount,
          share: newBuyerShare,
          status: 'ACTIVE'
        }
      })
    }

    // Create transaction for buyer position update
    await tx.transactionHistory.create({
      data: {
        tradeId: trade.id,
        activityType: TradeActivityType.POSITION_UPDATED,
        amount: trade.parAmount,
        status: TransactionStatus.COMPLETED,
        description: `Buyer position increased by ${trade.parAmount}`,
        effectiveDate: new Date(),
        processedBy: 'SYSTEM'
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
        await updatePositions(id)
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
        seller: {
          include: {
            entity: true
          }
        },
        buyer: {
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