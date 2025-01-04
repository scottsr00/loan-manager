const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteCreditData() {
  try {
    // Clear credit-related data in reverse order of dependencies
    const models = [
      'FacilityPositionHistory',
      'LenderPositionHistory',
      'Trade',
      'ServicingActivity',
      'Loan',
      'FacilitySublimit',
      'FacilityPosition',
      'Facility',
      'CreditAgreement'
    ]

    for (const model of models) {
      if (prisma[model.charAt(0).toLowerCase() + model.slice(1)]) {
        await prisma[model.charAt(0).toLowerCase() + model.slice(1)].deleteMany()
        console.log(`Cleared ${model}`)
      }
    }
    
    console.log('Credit data deletion completed successfully')
  } catch (error) {
    console.error('Error during credit data deletion:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Export for direct usage
module.exports = {
  deleteCreditData
}

// Only run if called directly
if (require.main === module) {
  deleteCreditData()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
} 