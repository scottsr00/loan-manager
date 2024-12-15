'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { withErrorHandling } from '@/lib/error-handling'
import { getTradeHistory, type Trade } from '@/app/actions/getTradeHistory'
import { bookTrade } from '@/app/actions/bookTrade'
import { getTradeComments, type TradeComment } from '@/app/actions/getTradeComments'
import { addTradeComment } from '@/app/actions/addTradeComment'

export interface BookTradeInput {
  loanId: string
  quantity: number
  price: number
  counterparty: string
  tradeDate: Date
  expectedSettlementDate: Date
  tradeType: 'Buy' | 'Sell'
}

export function useTrades() {
  const { data: trades, error, isLoading, mutate } = useSWR<Trade[]>(
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

export function useTradeComments(tradeId: number) {
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