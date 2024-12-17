'use server'

interface SofrRate {
  rate: number
  effectiveDate: string
  source?: string
  status: 'live' | 'fallback'
}

const FALLBACK_RATE: SofrRate = {
  rate: 5.33,
  effectiveDate: new Date().toISOString(),
  source: 'fallback',
  status: 'fallback'
}

function isValidRate(rate: number): boolean {
  return !isNaN(rate) && rate >= 0 && rate <= 15 // Reasonable range for SOFR rates
}

export async function getSofrRate(): Promise<SofrRate> {
  try {
    // In a production environment, this would fetch from an external API
    // For now, we'll return a mock rate
    const mockRate = 5.33 + (Math.random() - 0.5) * 0.1
    
    if (!isValidRate(mockRate)) {
      console.warn('Invalid SOFR rate received, using fallback rate')
      return FALLBACK_RATE
    }

    return {
      rate: Number(mockRate.toFixed(4)),
      effectiveDate: new Date().toISOString(),
      source: 'mock',
      status: 'live'
    }
  } catch (error) {
    console.error('Error fetching SOFR rate:', error)
    return FALLBACK_RATE
  }
} 