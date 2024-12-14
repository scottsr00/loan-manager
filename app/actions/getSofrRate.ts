'use server'

interface SofrRate {
  rate: number
  effectiveDate: string
}

export async function getSofrRate(): Promise<SofrRate> {
  try {
    // Using the NY Fed's SOFR API with a more reliable endpoint
    const response = await fetch(
      'https://markets.newyorkfed.org/api/rates/all/last/1.json',
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
      throw new Error('Failed to fetch SOFR rate')
    }

    const data = await response.json()
    const sofrRate = data.refRates.find((rate: any) => rate.type === 'SOFR')

    if (!sofrRate) {
      throw new Error('SOFR rate not found in response')
    }

    return {
      rate: sofrRate.percentRate,
      effectiveDate: sofrRate.effectiveDate
    }
  } catch (error) {
    console.error('Error fetching SOFR rate:', error)
    // Return a fallback value instead of throwing
    return {
      rate: 5.31, // Latest known SOFR rate as fallback
      effectiveDate: new Date().toISOString().split('T')[0]
    }
  }
} 