import { PrismaClient, type Entity, type Borrower, type Lender } from '@prisma/client'
const prisma = new PrismaClient()

interface CreditAgreementWithRelations {
  id: string
  agreementNumber: string
  borrowerId: string
  lenderId: string
  borrower: (Entity & { borrower: Borrower | null }) | null
  lender: (Entity & { lender: Lender | null }) | null
  status: string
  amount: number
  currency: string
  startDate: Date
  maturityDate: Date
  interestRate: number
  description: string | null
  createdAt: Date
  updatedAt: Date
}

async function fixCreditAgreements() {
  try {
    console.log('Starting credit agreement data fix...')

    // 1. Find all credit agreements with missing or invalid relationships
    const creditAgreements = await prisma.creditAgreement.findMany({
      include: {
        borrower: {
          select: {
            id: true,
            legalName: true,
            borrower: true
          }
        },
        lender: {
          select: {
            id: true,
            legalName: true,
            lender: true
          }
        }
      }
    }) as CreditAgreementWithRelations[]

    console.log(`Found ${creditAgreements.length} total credit agreements`)

    const invalidAgreements = creditAgreements.filter(
      ca => !ca.borrower?.borrower || !ca.lender?.lender
    )

    if (invalidAgreements.length === 0) {
      console.log('No invalid credit agreements found!')
      return
    }

    console.log(`Found ${invalidAgreements.length} invalid credit agreements`)

    // 2. For each invalid agreement, create missing borrower/lender records
    for (const agreement of invalidAgreements) {
      console.log(`\nFixing credit agreement: ${agreement.agreementNumber}`)

      // Fix borrower if needed
      if (!agreement.borrower?.borrower) {
        console.log('Creating missing borrower record...')
        await prisma.borrower.create({
          data: {
            name: agreement.borrower?.legalName || 'Unknown Borrower',
            entityId: agreement.borrowerId,
            industrySegment: 'UNKNOWN',
            businessType: 'UNKNOWN',
            onboardingStatus: 'PENDING',
            kycStatus: 'PENDING'
          }
        })
      }

      // Fix lender if needed
      if (!agreement.lender?.lender) {
        console.log('Creating missing lender record...')
        await prisma.lender.create({
          data: {
            entityId: agreement.lenderId,
            status: 'ACTIVE'
          }
        })
      }
    }

    // 3. Verify the fixes
    const verificationCheck = await prisma.creditAgreement.findMany({
      include: {
        borrower: {
          select: {
            id: true,
            legalName: true,
            borrower: true
          }
        },
        lender: {
          select: {
            id: true,
            legalName: true,
            lender: true
          }
        }
      }
    }) as CreditAgreementWithRelations[]

    const remainingInvalid = verificationCheck.filter(
      ca => !ca.borrower?.borrower || !ca.lender?.lender
    )

    if (remainingInvalid.length === 0) {
      console.log('\nAll credit agreements have been fixed successfully!')
    } else {
      console.log(`\nWarning: ${remainingInvalid.length} credit agreements still have issues`)
      console.log('You may need to manually investigate these agreements:', 
        remainingInvalid.map(ca => ca.agreementNumber))
    }

  } catch (error) {
    console.error('Error fixing credit agreements:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Only run if called directly
if (require.main === module) {
  fixCreditAgreements()
    .catch(error => {
      console.error('Error running fix script:', error)
      process.exit(1)
    })
} 