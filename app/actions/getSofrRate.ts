'use server'

interface SofrRate {
  rate: number
  effectiveDate: string
}

export async function getSofrRate(): Promise<SofrRate> {
  try {
    // Using the NY Fed's SOFR API
    const response = await fetch(
      'https://markets.newyorkfed.org/api/rates/secured/sofr/last/1.json'
    )

    if (!response.ok) {
      throw new Error('Failed to fetch SOFR rate')
    }

    const data = await response.json()
    const latestRate = data.refRates[0]

    return {
      rate: latestRate.percentRate,
      effectiveDate: latestRate.effectiveDate
    }
  } catch (error) {
    console.error('Error fetching SOFR rate:', error)
    return {
      rate: 0,
      effectiveDate: new Date().toISOString().split('T')[0]
    }
  }
} 