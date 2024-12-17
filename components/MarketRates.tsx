'use client'

import { useState, useEffect } from 'react'
import { getHistoricalRates } from '@/server/actions/loan/getHistoricalRates'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Info, Loader2 } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

interface ChartDataPoint {
  date: string
  [key: string]: number | string | undefined
}

const timeframes = [
  { label: '5 Days', value: '5d' },
  { label: '1 Month', value: '1m' },
  { label: '1 Year', value: '1y' },
  { label: '5 Years', value: '5y' }
]

const rateTypes = ['UST', 'SOFR', 'LIBOR', 'EURIBOR']
const terms = {
  UST: ['10Y'],
  SOFR: ['1M', '3M'],
  LIBOR: ['1M', '3M'],
  EURIBOR: ['1M', '3M']
}

const COLORS = {
  UST: '#dc2626',    // Red
  SOFR: '#2563eb',   // Blue
  LIBOR: '#16a34a',  // Green
  EURIBOR: '#eab308' // Yellow
}

const RATE_INFO = {
  UST: '10-Year U.S. Treasury Yield - Benchmark government rate',
  SOFR: 'Secured Overnight Financing Rate - Introduced April 2018',
  LIBOR: 'London Interbank Offered Rate - Discontinued June 2023',
  EURIBOR: 'Euro Interbank Offered Rate - Active'
}

export function MarketRates() {
  const [timeframe, setTimeframe] = useState('1m')
  const [selectedRates, setSelectedRates] = useState(rateTypes)
  const [selectedTerms, setSelectedTerms] = useState<string[]>(
    rateTypes.flatMap(rate => terms[rate as keyof typeof terms])
  )
  const [data, setData] = useState<MarketRate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const rates = await getHistoricalRates(timeframe)
        setData(rates)
      } catch (error) {
        console.error('Error fetching rates:', error)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [timeframe])

  const toggleRate = (rate: string) => {
    setSelectedRates(prev => {
      const newRates = prev.includes(rate)
        ? prev.filter(r => r !== rate)
        : [...prev, rate]
      
      // Update selected terms based on selected rates
      const availableTerms = newRates.flatMap(r => terms[r as keyof typeof terms])
      setSelectedTerms(prev => prev.filter(term => availableTerms.includes(term)))
      
      return newRates
    })
  }

  const toggleTerm = (term: string) => {
    setSelectedTerms(prev =>
      prev.includes(term)
        ? prev.filter(t => t !== term)
        : [...prev, term]
    )
  }

  // Format the data for the chart
  const chartData: ChartDataPoint[] = data.length > 0
    ? data[0].data.map(item => {
        const point: ChartDataPoint = { date: item.date }
        data.forEach(rate => {
          if (selectedRates.includes(rate.name) && selectedTerms.includes(rate.term)) {
            const key = `${rate.name} ${rate.term}`
            const dataPoint = rate.data.find(d => d.date === item.date)
            point[key] = dataPoint?.value
          }
        })
        return point
      })
    : []

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: timeframe === '5d' || timeframe === '1m' ? undefined : '2-digit'
    })
  }

  const formatRate = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const isRateAvailable = (rate: string, timeframe: string): boolean => {
    const rateData = data.find(r => r.name === rate)
    if (!rateData?.availableFrom && !rateData?.availableTo) return true
    
    const currentDate = new Date()
    const startDate = new Date(currentDate)
    
    switch (timeframe) {
      case '5d':
        startDate.setDate(currentDate.getDate() - 5)
        break
      case '1m':
        startDate.setMonth(currentDate.getMonth() - 1)
        break
      case '1y':
        startDate.setFullYear(currentDate.getFullYear() - 1)
        break
      case '5y':
        startDate.setFullYear(currentDate.getFullYear() - 5)
        break
    }
    
    if (rateData?.availableFrom && startDate < rateData.availableFrom) return false
    if (rateData?.availableTo && currentDate > rateData.availableTo) return false
    
    return true
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Rates</CardTitle>
        <CardDescription>Historical view of key market rates</CardDescription>
        <div className="flex flex-wrap gap-2 mt-4">
          {timeframes.map(tf => (
            <Button
              key={tf.value}
              variant={timeframe === tf.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(tf.value)}
            >
              {tf.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {rateTypes.map(rate => (
            <TooltipProvider key={rate}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedRates.includes(rate) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleRate(rate)}
                    className="gap-2"
                    disabled={!isRateAvailable(rate, timeframe)}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: COLORS[rate as keyof typeof COLORS] }} 
                    />
                    {rate}
                    <Info className="h-3 w-3 ml-1 opacity-50" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{RATE_INFO[rate as keyof typeof RATE_INFO]}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          ))}
          <div className="w-px h-6 bg-border mx-2" />
          {Object.entries(terms).map(([rate, rateTerms]) => 
            selectedRates.includes(rate) && rateTerms.map(term => (
              <Button
                key={`${rate}-${term}`}
                variant={selectedTerms.includes(term) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTerm(term)}
              >
                {term}
              </Button>
            ))
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading rates...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: 'rgb(var(--muted))' }}
                />
                <YAxis 
                  tickFormatter={formatRate}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: 'rgb(var(--muted))' }}
                />
                <Tooltip 
                  formatter={(value: number) => formatRate(value)}
                  labelFormatter={formatDate}
                />
                <Legend />
                {data.map(rate => {
                  if (selectedRates.includes(rate.name) && selectedTerms.includes(rate.term)) {
                    const key = `${rate.name} ${rate.term}`
                    return (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[rate.name as keyof typeof COLORS]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        name={`${rate.name} ${rate.term}`}
                      />
                    )
                  }
                  return null
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 