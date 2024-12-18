"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { useState, useEffect, useRef } from 'react'
import type { Borrower } from '@/types/borrower'

interface BorrowerDetailsModalProps {
  borrower: Borrower | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BorrowerDetailsModal({ borrower, open, onOpenChange }: BorrowerDetailsModalProps) {
  if (!borrower) return null

  const [canScroll, setCanScroll] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkScroll = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight } = contentRef.current
        setCanScroll(scrollHeight > clientHeight)
      }
    }

    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [borrower])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{borrower.name}</span>
            <div className="flex gap-2">
              <Badge variant={borrower.kycStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                KYC: {borrower.kycStatus}
              </Badge>
              <Badge variant={borrower.onboardingStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                {borrower.onboardingStatus}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="relative" ref={contentRef}>
          <ScrollArea className="h-[calc(80vh-8rem)] pr-4">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Industry</Label>
                    <div>{borrower.industry}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Jurisdiction</Label>
                    <div>{borrower.jurisdiction}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tax ID</Label>
                    <div>{borrower.taxId}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Risk & Compliance */}
              <div className="space-y-4">
                <h4 className="font-medium">Risk & Compliance</h4>
                <div className="grid grid-cols-2 gap-4">
                  {borrower.creditRating && (
                    <div>
                      <Label className="text-muted-foreground">Credit Rating</Label>
                      <div>{borrower.creditRating}</div>
                    </div>
                  )}
                  {borrower.ratingAgency && (
                    <div>
                      <Label className="text-muted-foreground">Rating Agency</Label>
                      <div>{borrower.ratingAgency}</div>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">KYC Status</Label>
                    <div>{borrower.kycStatus}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Onboarding Status</Label>
                    <div>{borrower.onboardingStatus}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="space-y-4">
                <h4 className="font-medium">Metadata</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <div>{format(new Date(borrower.createdAt), 'PPP')}</div>
                  </div>
                </div>
              </div>
            </div>
            <ScrollBar />
          </ScrollArea>
          {canScroll && (
            <div className="absolute bottom-0 left-0 right-4 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 