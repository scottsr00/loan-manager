'use server'

interface RateData {
  date: string
  value: number
}

interface MarketRate {
  name: string
  term: string
  data: RateData[]
}

type TimeFrame = '1M' | '3M' | '6M' | '1Y' | 'YTD'

function getDataPointsForTimeframe(timeframe: TimeFrame): number {
  switch (timeframe) {
    case '1M':
      return 30
    case '3M':
      return 90
    case '6M':
      return 180
    case '1Y':
      return 365
    case 'YTD':
      const now = new Date()
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      return Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    default:
      return 30
  }
}

export async function getHistoricalRates(
  rateType: string,
  term: string,
  timeframe: TimeFrame
): Promise<MarketRate[]> {
  try {
    const today = new Date()
    const dataPoints = getDataPointsForTimeframe(timeframe)
    const data: RateData[] = []
    
    // Generate mock data points
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        value: 5.33 + (Math.random() - 0.5) * 0.2
      })
    }

    return [{
      name: rateType,
      term: term,
      data: data.sort((a, b) => a.date.localeCompare(b.date))
    }]
  } catch (error) {
    console.error('Error fetching historical rates:', error)
    throw new Error('Failed to fetch historical rates')
  }
} 