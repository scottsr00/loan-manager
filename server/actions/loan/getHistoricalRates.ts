'use server'

interface RateData {
  date: string
  value: number
}

interface MarketRate {
  name: string
  term: string
  data: RateData[]
  availableFrom?: Date
  availableTo?: Date
}

type TimeFrame = '5d' | '1m' | '1y' | '5y'

function getDataPointsForTimeframe(timeframe: TimeFrame): number {
  switch (timeframe) {
    case '5d':
      return 5
    case '1m':
      return 30
    case '1y':
      return 365
    case '5y':
      return 365 * 5
    default:
      return 30
  }
}

export async function getHistoricalRates(
  timeframe: TimeFrame
): Promise<MarketRate[]> {
  try {
    const today = new Date()
    const dataPoints = getDataPointsForTimeframe(timeframe)
    const rates: MarketRate[] = []

    // Define rate configurations
    const rateConfigs = [
      { name: 'UST', terms: ['10Y'], baseRate: 4.5 },
      { name: 'SOFR', terms: ['1M', '3M'], baseRate: 5.33, availableFrom: new Date('2018-04-01') },
      { name: 'LIBOR', terms: ['1M', '3M'], baseRate: 5.15, availableTo: new Date('2023-06-30') },
      { name: 'EURIBOR', terms: ['1M', '3M'], baseRate: 3.75 }
    ]

    // Generate data for each rate and term
    for (const config of rateConfigs) {
      for (const term of config.terms) {
        const data: RateData[] = []
        
        // Generate mock data points
        for (let i = 0; i < dataPoints; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          
          // Add some variation based on term length
          const termFactor = term === '10Y' ? 1.5 : term === '3M' ? 1.2 : 1
          
          data.push({
            date: date.toISOString().split('T')[0],
            value: config.baseRate * termFactor + (Math.random() - 0.5) * 0.2
          })
        }

        rates.push({
          name: config.name,
          term: term,
          data: data.sort((a, b) => a.date.localeCompare(b.date)),
          ...(config.availableFrom && { availableFrom: config.availableFrom }),
          ...(config.availableTo && { availableTo: config.availableTo })
        })
      }
    }

    return rates
  } catch (error) {
    console.error('Error fetching historical rates:', error)
    throw new Error('Failed to fetch historical rates')
  }
} 