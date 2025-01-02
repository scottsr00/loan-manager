const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanCreditData() {
  try {
    console.log('Starting data cleanup...')

    // Delete in correct order to handle foreign key constraints
    console.log('Deleting transaction history...')
    await prisma.transactionHistory.deleteMany()

    console.log('Deleting trade status changes...')
    await prisma.tradeStatusChange.deleteMany()

    console.log('Deleting lender position history...')
    await prisma.lenderPositionHistory.deleteMany()

    console.log('Deleting trades...')
    await prisma.trade.deleteMany()

    console.log('Deleting facility positions...')
    await prisma.facilityPosition.deleteMany()

    console.log('Deleting facility sublimits...')
    await prisma.facilitySublimit.deleteMany()

    console.log('Deleting servicing activities...')
    await prisma.servicingActivity.deleteMany()

    console.log('Deleting loans...')
    await prisma.loan.deleteMany()

    console.log('Deleting facilities...')
    await prisma.facility.deleteMany()

    console.log('Deleting credit agreements...')
    await prisma.creditAgreement.deleteMany()

    console.log('Data cleanup completed successfully!')
  } catch (error) {
    console.error('Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Only run if called directly
if (require.main === module) {
  cleanCreditData()
    .catch(error => {
      console.error('Error running cleanup script:', error)
      process.exit(1)
    })
} 