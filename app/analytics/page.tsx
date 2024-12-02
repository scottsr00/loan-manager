'use client'

import { useEffect, useState } from 'react'
import { AnalyticsComponent } from '@/components/Analytics'
import { MarketRates } from '@/components/MarketRates'
import { getAnalytics } from '@/app/actions/getAnalytics'

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const analyticsData = await getAnalytics()
        setData(analyticsData)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return <div>Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      {data && <AnalyticsComponent {...data} />}
      <MarketRates />
    </div>
  )
} 