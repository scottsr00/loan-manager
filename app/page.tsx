import { Analytics } from '@/components/Analytics'
import { getAnalytics } from '@/server/actions/analytics'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const analytics = await getAnalytics()
  return <Analytics data={analytics} />
}