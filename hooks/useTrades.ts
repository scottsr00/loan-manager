'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { z } from 'zod'
import { getTradeHistory, type TradeHistoryItem } from '@/server/actions/trade/getTradeHistory'
import { bookTrade } from '@/server/actions/trade/bookTrade'
import { getTradeComments, type TradeComment } from '@/server/actions/trade/getTradeComments'
import { addTradeComment } from '@/server/actions/trade/addTradeComment'
import { withErrorHandling } from '@/lib/error-handling'

export interface BookTradeInput {
  facilityId: string
  amount: number
  price: number
  counterpartyId: string
  tradeDate: Date
  settlementDate: Date
  status: 'PENDING' | 'SETTLED'
}

export function useTrades() {
  const { data: trades, error, isLoading, mutate } = useSWR<TradeHistoryItem[]>(
    'trades',
    () => withErrorHandling(
      'fetch trades',
      async () => await getTradeHistory()
    ),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  )

  const book = useCallback(async (tradeData: BookTradeInput) => {
    await withErrorHandling(
      'book trade',
      async () => {
        await bookTrade(tradeData)
        await mutate()
      }
    )
  }, [mutate])

  return {
    trades,
    isLoading,
    isError: error,
    mutate,
    book
  }
}

export function useTradeComments(tradeId: string) {
  const { data: comments, error, isLoading, mutate } = useSWR<TradeComment[]>(
    tradeId ? `trade-comments-${tradeId}` : null,
    () => withErrorHandling(
      'fetch trade comments',
      async () => await getTradeComments(tradeId)
    )
  )

  const addComment = useCallback(async (content: string) => {
    await withErrorHandling(
      'add trade comment',
      async () => {
        await addTradeComment(tradeId, content)
        await mutate()
      }
    )
  }, [tradeId, mutate])

  return {
    comments,
    isLoading,
    isError: error,
    mutate,
    addComment
  }
} 