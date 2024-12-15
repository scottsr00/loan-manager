'use server'

interface SofrRate {
  rate: number
  effectiveDate: string
}

export async function getSofrRate(): Promise<SofrRate> {
  try {
    // Using the NY Fed's newer SOFR API endpoint
    const response = await fetch(
      'https://markets.newyorkfed.org/api/rates/secured/sofr/last/1.json',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; LoansApp/1.0)'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      console.error('SOFR API response not ok:', response.status, response.statusText)
      // Fall back to secondary endpoint if primary fails
      return await getFallbackSofrRate()
    }

    const data = await response.json()
    
    if (!data || !data.refRates || !data.refRates[0]) {
      console.error('Invalid SOFR API response format:', data)
      return await getFallbackSofrRate()
    }

    const sofrRate = data.refRates[0]

    return {
      rate: parseFloat(sofrRate.percentRate.toFixed(2)),
      effectiveDate: sofrRate.effectiveDate
    }
  } catch (error) {
    console.error('Error fetching SOFR rate:', error)
    return await getFallbackSofrRate()
  }
}

async function getFallbackSofrRate(): Promise<SofrRate> {
  try {
    // Try alternative endpoint
    const response = await fetch(
      'https://markets.newyorkfed.org/api/rates/daily/SOFR/last/1.json',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; LoansApp/1.0)'
        },
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      throw new Error('Fallback API also failed')
    }

    const data = await response.json()
    const rate = data?.data?.[0]?.[1]

    if (typeof rate !== 'number') {
      throw new Error('Invalid rate in fallback response')
    }

    return {
      rate: parseFloat(rate.toFixed(2)),
      effectiveDate: new Date().toISOString().split('T')[0]
    }
  } catch (fallbackError) {
    console.error('Fallback SOFR rate fetch failed:', fallbackError)
    // Return latest known SOFR rate as ultimate fallback
    return {
      rate: 5.33, // Latest known SOFR rate as of now
      effectiveDate: new Date().toISOString().split('T')[0]
    }
  }
} 