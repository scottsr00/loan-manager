'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { EntityWithRelations, EntityType } from '@/types/entity'
import {
  getEntities,
  getEntityTypes,
  getBankEntities,
  getBorrowerEntities,
  createEntity,
  updateEntity,
  deleteEntity,
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

  const update = useCallback(async (id: string, entityData: any) => {
    const result = await updateEntity(id, entityData)
    mutate()
    return result
  }, [mutate])

  const remove = useCallback(async (id: string) => {
    await deleteEntity(id)
    mutate()
  }, [mutate])

  return {
    entities: data,
    isLoading,
    isError: error,
    mutate,
    create,
    update,
    remove,
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

export function useBankEntities() {
  const { data, error, isLoading } = useSWR<EntityWithRelations[]>(
    'bankEntities',
    () => getBankEntities()
  )

  return {
    bankEntities: data,
    isLoading,
    isError: error,
  }
}

export function useBorrowerEntities() {
  const { data, error, isLoading } = useSWR<EntityWithRelations[]>(
    'borrowerEntities',
    () => getBorrowerEntities()
  )

  return {
    borrowerEntities: data,
    isLoading,
    isError: error,
  }
} 