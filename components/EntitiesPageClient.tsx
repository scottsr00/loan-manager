'use client'

import { useRouter } from 'next/navigation'
import { EntityList } from './EntityList'
import { NewEntityModal } from './NewEntityModal'
import { EntityWithRelations } from '@/server/actions/entity'

export function EntitiesPageClient({ entities }: { entities: EntityWithRelations[] }) {
  const router = useRouter()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Entities</h2>
        <NewEntityModal 
          onEntityCreated={() => {
            router.refresh()
          }} 
        />
      </div>
      <EntityList entities={entities} />
    </div>
  )
} 