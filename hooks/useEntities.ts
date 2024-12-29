'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { EntityWithRelations } from '@/server/types/entity'
import {
  getEntities,
  getEntityTypes,
  createEntity,
} from '@/server/actions/entity'

type EntityType = {
  name: string
  id: string
  createdAt: Date
  updatedAt: Date
  description: string | null
}

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

export function useEntityTypes() {
  const { data, error, isLoading } = useSWR<EntityType[]>(
    'entityTypes',
    () => getEntityTypes()
  )

  return {
    entityTypes: data,
    isLoading,
    isError: error,
  }
} 