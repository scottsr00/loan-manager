'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBorrower } from '@/server/actions/borrower/updateBorrower'
import { createBorrower } from '@/server/actions/borrower/createBorrower'
import { createEntity, updateEntity } from '@/server/actions/entity'
import type { Borrower } from '@/types/borrower'
import { onboardingStatusEnum, kycStatusEnum } from '@/server/types/borrower'
import { toast } from 'sonner'

// Explicitly define the enum values to match the database
type OnboardingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
type KycStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'

const ONBOARDING_STATUSES: OnboardingStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']
const KYC_STATUSES: KycStatus[] = ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED']

interface BorrowerModalProps {
  borrower?: Borrower | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function BorrowerModal({ borrower, isOpen, onClose, onUpdate }: BorrowerModalProps) {
  const [name, setName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [countryOfIncorporation, setCountryOfIncorporation] = useState('')
  const [industrySegment, setIndustrySegment] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [creditRating, setCreditRating] = useState('')
  const [ratingAgency, setRatingAgency] = useState('')
  const [riskRating, setRiskRating] = useState('')
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('PENDING')
  const [kycStatus, setKycStatus] = useState<KycStatus>('PENDING')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (borrower) {
      setName(borrower.entity.legalName)
      setTaxId(borrower.entity.taxId || '')
      setCountryOfIncorporation(borrower.entity.countryOfIncorporation || '')
      setIndustrySegment(borrower.industrySegment || '')
      setBusinessType(borrower.businessType || '')
      setCreditRating(borrower.creditRating || '')
      setRatingAgency(borrower.ratingAgency || '')
      setRiskRating(borrower.riskRating || '')
      // Ensure we're using the correct enum values
      setOnboardingStatus(borrower.onboardingStatus as OnboardingStatus)
      setKycStatus(borrower.kycStatus as KycStatus)
    } else {
      setName('')
      setTaxId('')
      setCountryOfIncorporation('')
      setIndustrySegment('')
      setBusinessType('')
      setCreditRating('')
      setRatingAgency('')
      setRiskRating('')
      setOnboardingStatus('PENDING')
      setKycStatus('PENDING')
    }
  }, [borrower])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      let entityId = borrower?.entity?.id

      // Create or update entity
      const entityData = {
        legalName: name.trim(),
        status: 'ACTIVE',
        addresses: [{
          type: 'BUSINESS',
          street1: 'TBD',
          city: 'TBD',
          country: countryOfIncorporation.trim() || 'US',
          isPrimary: true
        }],
        contacts: [{
          type: 'PRIMARY',
          firstName: 'TBD',
          lastName: 'TBD',
          title: 'Primary Contact',
          isPrimary: true
        }],
        ...(taxId.trim() ? { taxId: taxId.trim() } : {}),
        ...(countryOfIncorporation.trim() ? { countryOfIncorporation: countryOfIncorporation.trim() } : {})
      }

      if (borrower) {
        // Update existing entity
        await updateEntity(borrower.entity.id, entityData)
      } else {
        // Create new entity
        const entity = await createEntity(entityData)
        entityId = entity.id
      }

      // Common borrower data
      const commonBorrowerData = {
        industrySegment: industrySegment.trim(),
        businessType: businessType.trim(),
        onboardingStatus: onboardingStatus as OnboardingStatus,
        kycStatus: kycStatus as KycStatus,
        ...(creditRating.trim() ? { creditRating: creditRating.trim() } : {}),
        ...(ratingAgency.trim() ? { ratingAgency: ratingAgency.trim() } : {}),
        ...(riskRating.trim() ? { riskRating: riskRating.trim() } : {})
      }

      if (borrower) {
        // Update existing borrower
        await updateBorrower(borrower.id, commonBorrowerData)
        toast.success('Borrower updated successfully')
      } else {
        // Create new borrower with entityId
        await createBorrower({
          ...commonBorrowerData,
          entityId: entityId!
        })
        toast.success('Borrower created successfully')
      }
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error saving borrower:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save borrower')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>{borrower ? 'Edit Borrower' : 'New Borrower'}</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Legal Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="taxId">Tax ID</Label>
            <Input
              id="taxId"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="countryOfIncorporation">Country of Incorporation</Label>
            <Input
              id="countryOfIncorporation"
              value={countryOfIncorporation}
              onChange={(e) => setCountryOfIncorporation(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="industrySegment">Industry Segment</Label>
            <Input
              id="industrySegment"
              value={industrySegment}
              onChange={(e) => setIndustrySegment(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Input
              id="businessType"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="creditRating">Credit Rating</Label>
            <Input
              id="creditRating"
              value={creditRating}
              onChange={(e) => setCreditRating(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ratingAgency">Rating Agency</Label>
            <Input
              id="ratingAgency"
              value={ratingAgency}
              onChange={(e) => setRatingAgency(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="riskRating">Risk Rating</Label>
            <Input
              id="riskRating"
              value={riskRating}
              onChange={(e) => setRiskRating(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="onboardingStatus">Onboarding Status</Label>
            <select
              id="onboardingStatus"
              value={onboardingStatus}
              onChange={(e) => setOnboardingStatus(e.target.value as OnboardingStatus)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            >
              {ONBOARDING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="kycStatus">KYC Status</Label>
            <select
              id="kycStatus"
              value={kycStatus}
              onChange={(e) => setKycStatus(e.target.value as KycStatus)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            >
              {KYC_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : borrower ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 