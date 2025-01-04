'use server'

import { prisma } from '@/server/db/client'
import { TradeStatus } from '@/server/types/trade'
import { revalidatePath } from 'next/cache'
import { closeTrade } from './closeTrade'

interface UpdateTradeStatusParams {
  id: string
  status: keyof typeof TradeStatus
  description?: string
  userId?: string
}

export async function updateTradeStatus({ id, status, description, userId = 'SYSTEM' }: UpdateTradeStatusParams) {
  const trade = await prisma.trade.findUnique({
    where: { id },
    select: { status: true }
  })

  if (!trade) {
    throw new Error('Trade not found')
  }

  // Validate status transition
  const validTransitions: Record<string, (keyof typeof TradeStatus)[]> = {
    [TradeStatus.PENDING]: [TradeStatus.CONFIRMED],
    [TradeStatus.CONFIRMED]: [TradeStatus.SETTLED],
    [TradeStatus.SETTLED]: [TradeStatus.CLOSED],
    [TradeStatus.CLOSED]: []
  }

  const allowedNextStatuses = validTransitions[trade.status]
  if (!allowedNextStatuses.includes(status)) {
    throw new Error(`Invalid status transition from ${trade.status} to ${status}`)
  }

  if (status === TradeStatus.CLOSED) {
    // If transitioning to CLOSED, use the closeTrade action
    await closeTrade(id, userId)
  } else {
    // For other status transitions, just update the status
    await prisma.trade.update({
      where: { id },
      data: { status }
    })
  }

  // Create status change record
  await prisma.tradeStatusChange.create({
    data: {
      tradeId: id,
      fromStatus: trade.status,
      toStatus: status,
      description
    }
  })

  revalidatePath('/trades')
  revalidatePath('/') // Revalidate the main page where positions are shown
} 