import { getCreditAgreements } from '@/app/actions/getCreditAgreements'
import { CreditAgreementsPageClient } from '@/components/CreditAgreementsPageClient'

export const dynamic = 'force-dynamic'

export default async function CreditAgreementsPage() {
  const creditAgreements = await getCreditAgreements()

  return <CreditAgreementsPageClient creditAgreements={creditAgreements} />
} 