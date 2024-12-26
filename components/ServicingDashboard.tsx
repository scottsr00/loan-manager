'use client'

import { useState, useEffect, useMemo } from 'react'
import { getServicingActivities } from '@/server/actions/loan/getServicingActivities'
import { addServicingActivity } from '@/server/actions/loan/addServicingActivity'
import { updateServicingActivity } from '@/server/actions/loan/updateServicingActivity'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatCurrency } from "@/lib/utils"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { getFacilities } from '@/server/actions/loan/getFacilities'
import { DataGrid } from '@/components/ui/data-grid'
import { ColDef } from 'ag-grid-community'
import { useServicing } from '@/hooks/useServicing'
import { ServicingActivityDetailsModal } from '@/components/ServicingActivityDetailsModal'

interface Facility {
  id: string
  facilityName: string
  creditAgreement: {
    agreementNumber: string
  }
}

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
  loan?: {
    id: string
  }
}

export function ServicingDashboard() {
  const [activities, setActivities] = useState<ServicingActivityType[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ServicingActivityType | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [filters, setFilters] = useState({
    status: null as string | null,
    activityType: null as string | null,
    facilityId: null as string | null,
    startDate: null as Date | null,
    endDate: null as Date | null
  })

  // New activity form state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newActivity, setNewActivity] = useState({
    facilityId: '',
    activityType: '',
    status: 'PENDING',
    dueDate: new Date(),
    description: '',
    amount: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { processPaydown } = useServicing()

  const loadActivities = async () => {
    setError(null)
    try {
      const data = await getServicingActivities({
        status: filters.status || undefined,
        activityType: filters.activityType || undefined,
        facilityId: filters.facilityId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      })
      
      // Map the response to match our ServicingActivityType
      const mappedActivities: ServicingActivityType[] = data.activities.map(activity => ({
        id: activity.id,
        facilityId: activity.facilityId,
        activityType: activity.activityType,
        status: activity.status,
        dueDate: activity.dueDate,
        description: activity.description,
        amount: activity.amount,
        completedAt: activity.completedAt,
        completedBy: activity.completedBy,
        facility: activity.facility ? {
          facilityName: activity.facility.facilityName,
          creditAgreement: activity.facility.creditAgreement ? {
            agreementNumber: activity.facility.creditAgreement.agreementNumber
          } : undefined
        } : undefined,
        loan: activity.loan ? {
          id: activity.loan.id
        } : undefined
      }))
      
      setActivities(mappedActivities)
    } catch (err) {
      setError('Failed to load servicing activities')
      console.error(err)
    }
  }

  const loadFacilities = async () => {
    try {
      const data = await getFacilities()
      // Map the response to match our Facility type
      const mappedFacilities: Facility[] = data.map(facility => ({
        id: facility.id,
        facilityName: facility.facilityName,
        creditAgreement: {
          agreementNumber: facility.creditAgreement.agreementNumber
        }
      }))
      setFacilities(mappedFacilities)
    } catch (err) {
      console.error('Error loading facilities:', err)
    }
  }

  useEffect(() => {
    loadActivities()
    loadFacilities()
  }, [])

  useEffect(() => {
    loadActivities()
  }, [filters])

  const handleAddActivity = async () => {
    setIsSubmitting(true)
    try {
      await addServicingActivity({
        ...newActivity,
        amount: newActivity.amount ? parseFloat(newActivity.amount) : 0,
      })
      setIsDialogOpen(false)
      setNewActivity({
        facilityId: '',
        activityType: '',
        status: 'PENDING',
        dueDate: new Date(),
        description: '',
        amount: '',
      })
      loadActivities()
    } catch (err) {
      console.error('Error adding activity:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = async (activity: ServicingActivityType) => {
    try {
      setIsUpdating(true)
      
      // Process the paydown if it's a payment activity
      if (['PRINCIPAL_PAYMENT', 'INTEREST_PAYMENT', 'UNSCHEDULED_PAYMENT'].includes(activity.activityType)) {
        await processPaydown({
          loanId: activity.loan?.id || '',
          facilityId: activity.facilityId,
          amount: activity.amount,
          paymentDate: new Date(),
          description: activity.description || undefined,
          servicingActivityId: activity.id
        })
      }

      // Update the activity status
      await updateServicingActivity({
        id: activity.id,
        status: 'COMPLETED',
        completedBy: 'Current User'
      })

      await loadActivities()
    } catch (err) {
      console.error('Error completing activity:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const columnDefs = useMemo<ColDef<ServicingActivityType>[]>(() => [
    {
      field: 'facility.facilityName',
      headerName: 'Facility',
      flex: 1,
      valueGetter: params => {
        const facility = params.data?.facility;
        return facility ? `${facility.facilityName} (${facility.creditAgreement?.agreementNumber || 'N/A'})` : 'N/A';
      }
    },
    {
      field: 'activityType',
      headerName: 'Type',
      flex: 1,
      valueFormatter: params => {
        const types: Record<string, string> = {
          'INTEREST_PAYMENT': 'Interest Payment',
          'PRINCIPAL_PAYMENT': 'Principal Payment',
          'UNSCHEDULED_PAYMENT': 'Unscheduled Payment'
        };
        return types[params.value] || params.value;
      }
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      flex: 1,
      valueFormatter: params => {
        if (!params.value) return '';
        try {
          return format(new Date(params.value), 'MMMM d, yyyy');
        } catch (error) {
          console.error('Error formatting date:', error);
          return 'Invalid date';
        }
      },
      filter: 'agDateColumnFilter',
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      valueFormatter: params => formatCurrency(params.value),
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      cellRenderer: (params: { value: string }) => {
        const variants = {
          'PENDING': 'default',
          'IN_PROGRESS': 'secondary',
          'COMPLETED': 'success',
          'OVERDUE': 'destructive'
        } as const;
        return <Badge variant={variants[params.value as keyof typeof variants] || 'default'}>{params.value}</Badge>;
      },
    },
    {
      headerName: 'Actions',
      width: 200,
      sortable: false,
      filter: false,
      cellRenderer: (params: { data: ServicingActivityType }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedActivity(params.data);
              setIsDetailsOpen(true);
            }}
          >
            Details
          </Button>
          {params.data.status !== 'COMPLETED' && (
            <Button
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={(e) => {
                e.stopPropagation();
                handleComplete(params.data);
              }}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete'
              )}
            </Button>
          )}
        </div>
      )
    }
  ], [isUpdating])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Select
            value={filters.status || undefined}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.activityType || undefined}
            onValueChange={(value) => setFilters(prev => ({ ...prev, activityType: value }))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INTEREST_PAYMENT">Interest Payment</SelectItem>
              <SelectItem value="PRINCIPAL_PAYMENT">Principal Payment</SelectItem>
              <SelectItem value="UNSCHEDULED_PAYMENT">Unscheduled Payment</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal",
                  !filters.startDate && "text-muted-foreground"
                )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, "MMMM d, yyyy") : <span>Start Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate || undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date || null }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal",
                  !filters.endDate && "text-muted-foreground"
                )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, "MMMM d, yyyy") : <span>End Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate || undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date || null }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)}>
            <span className="text-lg mr-2">+</span>
            Add Activity
          </Button>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Servicing Activity</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="facility">Facility</Label>
                <Select
                  value={newActivity.facilityId}
                  onValueChange={(value) => setNewActivity(prev => ({ ...prev, facilityId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {`${facility.facilityName} (${facility.creditAgreement.agreementNumber})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Activity Type</Label>
                <Select
                  value={newActivity.activityType}
                  onValueChange={(value) => setNewActivity(prev => ({ ...prev, activityType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTEREST_PAYMENT">Interest Payment</SelectItem>
                    <SelectItem value="PRINCIPAL_PAYMENT">Principal Payment</SelectItem>
                    <SelectItem value="UNSCHEDULED_PAYMENT">Unscheduled Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !newActivity.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newActivity.dueDate ? format(newActivity.dueDate, "MMMM d, yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newActivity.dueDate}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          setNewActivity(prev => ({ ...prev, dueDate: date }))
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter activity description"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newActivity.amount}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>

              <Button
                onClick={handleAddActivity}
                disabled={isSubmitting || !newActivity.facilityId || !newActivity.activityType}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Activity'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <DataGrid
        rowData={activities}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          floatingFilter: true,
        }}
      />

      <ServicingActivityDetailsModal
        activity={selectedActivity}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onUpdate={loadActivities}
      />

      <div className="hidden">
        Debug: Modal should be {isDetailsOpen ? 'open' : 'closed'}, 
        Activity: {selectedActivity?.id}
      </div>
    </div>
  )
} 