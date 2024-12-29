'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateServicingActivity } from '@/server/actions/loan/updateServicingActivity'
import { toast } from 'sonner'
import { useServicing } from '@/hooks/useServicing'

interface ServicingActivityType {
  id: string
  facilityId: string
  activityType: string
  status: string
  dueDate: Date | null
  description: string | null
  amount: number
  completedAt?: Date | null
  completedBy?: string | null
  facility?: {
    facilityName: string
    creditAgreement?: {
      agreementNumber: string
    }
  }
  loans?: Array<{
    id: string
    status: string
    outstandingAmount: number
    paymentShare: number
  }>
}

interface ServicingActivityDetailsModalProps {
  activity: ServicingActivityType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function ServicingActivityDetailsModal({
  activity,
  open,
  onOpenChange,
  onUpdate,
}: ServicingActivityDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { processPaydown } = useServicing()

  if (!activity) return null

  const getStatusBadge = (status: string) => {
    const variants = {
      'PENDING': 'default',
      'IN_PROGRESS': 'secondary',
      'COMPLETED': 'success',
      'OVERDUE': 'destructive'
    } as const
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status}</Badge>
  }

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      // If completing a payment activity, process the paydown first
      if (newStatus === 'COMPLETED' && 
          ['PRINCIPAL_PAYMENT', 'INTEREST_PAYMENT', 'UNSCHEDULED_PAYMENT'].includes(activity.activityType)) {
        
        if (!activity.loans?.length) {
          throw new Error('No active loans found for payment activities')
        }

        // Process paydown for each loan based on their calculated shares
        await Promise.all(activity.loans.map(loan => 
          processPaydown({
            loanId: loan.id,
            facilityId: activity.facilityId,
            amount: loan.paymentShare,
            paymentDate: new Date(),
            description: activity.description || undefined,
            servicingActivityId: activity.id
          })
        ))
      }

      await updateServicingActivity({
        id: activity.id,
        status: newStatus,
        completedBy: 'Current User' // TODO: Replace with actual user
      })
      toast.success('Status updated successfully')
      onUpdate?.()
    } catch (err) {
      console.error('Error updating activity status:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-4">
            Activity Details
            {getStatusBadge(activity.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Facility</Label>
                <p className="mt-1">
                  {activity.facility ? (
                    <>
                      {activity.facility.facilityName}
                      {activity.facility.creditAgreement && (
                        <span className="text-muted-foreground ml-1">
                          ({activity.facility.creditAgreement.agreementNumber})
                        </span>
                      )}
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                <p className="mt-1">
                  {(() => {
                    const types: Record<string, string> = {
                      'INTEREST_PAYMENT': 'Interest Payment',
                      'PRINCIPAL_PAYMENT': 'Principal Payment',
                      'UNSCHEDULED_PAYMENT': 'Unscheduled Payment'
                    };
                    return types[activity.activityType] || activity.activityType;
                  })()}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Due Date</Label>
                <p className="mt-1">
                  {activity.dueDate ? (
                    format(new Date(activity.dueDate), "MMMM d, yyyy")
                  ) : (
                    'No date specified'
                  )}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                <p className="mt-1">{formatCurrency(activity.amount)}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="mt-1">{activity.description || 'No description'}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="mt-1 flex items-center gap-4">
                  {getStatusBadge(activity.status)}
                  {activity.status !== 'COMPLETED' && (
                    <Select
                      value={activity.status}
                      onValueChange={handleUpdateStatus}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Mark as Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">Mark as In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Mark as Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Information */}
          {activity.completedAt && (
            <Card>
              <CardHeader>
                <CardTitle>Completion Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Completed By</Label>
                  <p className="mt-1">{activity.completedBy || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Completed At</Label>
                  <p className="mt-1">
                    {activity.completedAt ? (
                      format(new Date(activity.completedAt), "MMMM d, yyyy")
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 