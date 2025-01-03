'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { EntityWithRelations } from '@/server/types/entity'
import {
  getEntities,
  createEntity,
} from '@/server/actions/entity'

export function useEntities() {
  const { data, error, isLoading, mutate } = useSWR<EntityWithRelations[]>(
    'entities',
    () => getEntities()
  )

  const create = useCallback(async (entityData: any) => {
    const result = await createEntity(entityData)
    mutate()
    return result
  }, [mutate])

  return {
    entities: data,
    isLoading,
    isError: error,
    mutate,
    create,
  }
} 