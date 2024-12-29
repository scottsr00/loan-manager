import { getCreditAgreements } from '@/server/actions/loan/getCreditAgreements'
import { CreditAgreementsPageClient } from '@/components/credit-agreements/CreditAgreementsPageClient'

export const dynamic = 'force-dynamic'

export default async function CreditAgreementsPage() {
  const initialCreditAgreements = await getCreditAgreements()

  return <CreditAgreementsPageClient initialCreditAgreements={initialCreditAgreements} />
} 