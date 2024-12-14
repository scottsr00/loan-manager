import { Suspense } from 'react'
import { getEntities } from '@/app/actions/getEntities'
import { EntitiesPageClient } from '@/components/EntitiesPageClient'

export default async function EntitiesPage() {
  const entities = await getEntities()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EntitiesPageClient entities={entities} />
    </Suspense>
  )
} 