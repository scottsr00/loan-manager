import { getEntities } from '@/server/actions/entity'
import { EntitiesPageClient } from '@/components/EntitiesPageClient'

export const dynamic = 'force-dynamic'

export default async function EntitiesPage() {
  const entities = await getEntities()
  return <EntitiesPageClient entities={entities} />
} 