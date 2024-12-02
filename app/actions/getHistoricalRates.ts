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

// This is a mock implementation. In production, you would fetch from actual market data providers
export async function getHistoricalRates(timeframe: string): Promise<MarketRate[]> {
  const endDate = new Date()
  const startDate = new Date()
  
  // Set the start date based on timeframe
  switch (timeframe) {
    case '5d':
      startDate.setDate(endDate.getDate() - 5)
      break
    case '1m':
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
    case '5y':
      startDate.setFullYear(endDate.getFullYear() - 5)
      break
    default:
      startDate.setMonth(endDate.getMonth() - 1) // Default to 1 month
  }

  // Generate dates between start and end
  const dates: string[] = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Mock data generation function with trend bias and historical patterns
  const generateRateData = (
    baseRate: number, 
    volatility: number, 
    availableFrom?: Date,
    availableTo?: Date,
    trendBias: number = 0, // Positive for upward trend, negative for downward
    options: {
      minRate?: number,
      maxRate?: number,
      cyclical?: boolean // For rates that show cyclical patterns
    } = {}
  ): RateData[] => {
    let currentRate = baseRate
    const { minRate = 0, maxRate = 15, cyclical = false } = options
    let trendDirection = 1 // For cyclical patterns

    return dates
      .filter(date => {
        const dateObj = new Date(date)
        const isAfterStart = !availableFrom || dateObj >= availableFrom
        const isBeforeEnd = !availableTo || dateObj <= availableTo
        return isAfterStart && isBeforeEnd
      })
      .map((date, index, array) => {
        if (cyclical && index % 90 === 0) { // Change trend direction every ~3 months
          trendDirection *= -1
        }

        const cyclicalBias = cyclical ? (0.005 * trendDirection) : 0
        const randomChange = (Math.random() - 0.5) * volatility + trendBias + cyclicalBias
        currentRate = Math.max(minRate, Math.min(maxRate, currentRate + randomChange))

        return {
          date,
          value: Number(currentRate.toFixed(4))
        }
      })
  }

  const sofrStartDate = new Date('2018-04-03')
  const liborEndDate = new Date('2023-06-30')

  // Generate mock data for different rates with historical accuracy
  return [
    {
      name: 'OBFR',
      term: 'ON',  // Overnight rate
      data: generateRateData(5.33, 0.01, undefined, undefined, 0.0001, {
        minRate: 0.01,
        maxRate: 5.5,
        cyclical: false
      })
    },
    {
      name: 'UST',
      term: '10Y',
      data: generateRateData(4.25, 0.015, undefined, undefined, 0.0001, {
        minRate: 0.5,
        maxRate: 15.0,
        cyclical: true
      })
    },
    {
      name: 'SOFR',
      term: '1M',
      availableFrom: sofrStartDate,
      data: generateRateData(5.33, 0.02, sofrStartDate, undefined, 0.001, {
        minRate: 0.01,
        maxRate: 5.5
      })
    },
    {
      name: 'SOFR',
      term: '3M',
      availableFrom: sofrStartDate,
      data: generateRateData(5.45, 0.02, sofrStartDate, undefined, 0.001, {
        minRate: 0.01,
        maxRate: 5.7
      })
    },
    {
      name: 'LIBOR',
      term: '1M',
      availableFrom: undefined,
      availableTo: liborEndDate,
      data: generateRateData(5.43, 0.03, undefined, liborEndDate, -0.001, {
        minRate: 0.1,
        maxRate: 6.0
      })
    },
    {
      name: 'LIBOR',
      term: '3M',
      availableFrom: undefined,
      availableTo: liborEndDate,
      data: generateRateData(5.52, 0.03, undefined, liborEndDate, -0.001, {
        minRate: 0.1,
        maxRate: 6.0
      })
    },
    {
      name: 'EURIBOR',
      term: '1M',
      data: generateRateData(3.95, 0.01, undefined, undefined, 0.0005, {
        minRate: -0.5,   // EURIBOR has gone negative
        maxRate: 4.5
      })
    },
    {
      name: 'EURIBOR',
      term: '3M',
      data: generateRateData(3.93, 0.01, undefined, undefined, 0.0005, {
        minRate: -0.5,   // EURIBOR has gone negative
        maxRate: 4.5
      })
    }
  ]
} 