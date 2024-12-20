'use client'

import { useState, useEffect, useMemo } from 'react'
import { type ServicingActivity, getServicingActivities } from '@/server/actions/loan/getServicingActivities'
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
import { ColDef, ICellRendererParams } from 'ag-grid-community'
import { useServicing } from '@/hooks/useServicing'

interface ServicingActivityType {
  id: string
  facilityId: string
  activityType: string
  status: string
  dueDate: Date
  description: string
  amount: number
  completedAt?: Date | null
  completedBy?: string | null
  facility: {
    facilityName: string
    creditAgreement: {
      agreementName: string
    }
  }
}

export function ServicingDashboard() {
  const [activities, setActivities] = useState<ServicingActivityType[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ServicingActivityType | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [facilities, setFacilities] = useState<{
    id: string;
    facilityName: string;
    creditAgreement: { agreementName: string }
  }[]>([])
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
      setActivities(data.activities)
    } catch (err) {
      setError('Failed to load servicing activities')
      console.error(err)
    }
  }

  const loadFacilities = async () => {
    try {
      const data = await getFacilities()
      setFacilities(data)
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

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedActivity) return

    setIsUpdating(true)
    try {
      await updateServicingActivity({
        id: selectedActivity.id,
        status: newStatus,
        completedBy: 'Current User' // TODO: Replace with actual user
      })
      await loadActivities()
      setIsDetailsOpen(false) // Close the modal after successful update
    } catch (err) {
      console.error('Error updating activity status:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'PENDING': 'default',
      'IN_PROGRESS': 'secondary',
      'COMPLETED': 'success',
      'OVERDUE': 'destructive'
    } as const
    return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status}</Badge>
  }

  const handleComplete = async (activity: any) => {
    try {
      setIsUpdating(true)
      
      // Process the paydown if it's a payment activity
      if (['PRINCIPAL_PAYMENT', 'INTEREST_PAYMENT', 'UNSCHEDULED_PAYMENT'].includes(activity.activityType)) {
        await processPaydown({
          loanId: activity.loan?.id,
          facilityId: activity.facilityId,
          amount: activity.amount,
          paymentDate: new Date(),
          description: activity.description
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

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'facility.facilityName',
      headerName: 'Facility',
      flex: 1,
      valueGetter: params => {
        const facility = params.data?.facility;
        return facility ? `${facility.facilityName} (${facility.creditAgreement?.agreementName || 'N/A'})` : 'N/A';
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
          return format(new Date(params.value), 'PPP');
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
      cellRenderer: (params: { value: string }) => getStatusBadge(params.value),
    },
    {
      headerName: 'Actions',
      field: 'actions',
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams) => {
        if (params.data.status === 'COMPLETED') {
          return <Badge variant="success">Completed</Badge>;
        }
        return (
          <div onClick={(e) => {
            e.stopPropagation();
            handleComplete(params.data);
          }}>
            <Button
              size="sm"
              variant="outline"
              disabled={isUpdating}
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
          </div>
        );
      }
    }
  ], [isUpdating, loadActivities])

  const handleRowClick = (params: { data: ServicingActivityType }) => {
    setSelectedActivity(params.data)
    setIsDetailsOpen(true)
  }

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
                  {filters.startDate ? format(filters.startDate, "PP") : <span>Start Date</span>}
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
                  {filters.endDate ? format(filters.endDate, "PP") : <span>End Date</span>}
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
                        {`${facility.facilityName} (${facility.creditAgreement.agreementName})`}
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
                      {newActivity.dueDate ? format(newActivity.dueDate, "PPP") : <span>Pick a date</span>}
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
        onRowClick={handleRowClick}
        suppressRowClickSelection={true}
      />

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="min-h-[600px] max-h-[80vh] w-full max-w-4xl overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle>Activity Details</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="grid gap-6 py-6 px-6">
              <div className="grid gap-3">
                <Label className="text-base font-semibold">Facility</Label>
                <div className="text-sm">
                  {selectedActivity.facility ? (
                    <>
                      {selectedActivity.facility.facilityName}
                      {selectedActivity.facility.creditAgreement && (
                        <span className="text-muted-foreground ml-1">
                          ({selectedActivity.facility.creditAgreement.agreementName})
                        </span>
                      )}
                    </>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <Label className="text-base font-semibold">Type</Label>
                <div className="text-sm">
                  {(() => {
                    const types: Record<string, string> = {
                      'INTEREST_PAYMENT': 'Interest Payment',
                      'PRINCIPAL_PAYMENT': 'Principal Payment',
                      'UNSCHEDULED_PAYMENT': 'Unscheduled Payment'
                    };
                    return types[selectedActivity.activityType] || selectedActivity.activityType;
                  })()}
                </div>
              </div>

              <div className="grid gap-3">
                <Label className="text-base font-semibold">Due Date</Label>
                <div className="text-sm">
                  {selectedActivity.dueDate ? (
                    format(new Date(selectedActivity.dueDate), "PPP")
                  ) : (
                    'No date specified'
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <Label className="text-base font-semibold">Amount</Label>
                <div className="text-sm">{formatCurrency(selectedActivity.amount)}</div>
              </div>

              <div className="grid gap-3">
                <Label className="text-base font-semibold">Description</Label>
                <div className="text-sm">{selectedActivity.description || 'No description'}</div>
              </div>

              <div className="grid gap-3">
                <Label className="text-base font-semibold">Status</Label>
                <div className="flex items-center gap-4">
                  <div className="text-sm">{getStatusBadge(selectedActivity.status)}</div>
                  {selectedActivity.status !== 'COMPLETED' && (
                    <Select
                      value={selectedActivity.status}
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

              {selectedActivity.completedAt && (
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label className="text-base font-semibold">Completed By</Label>
                    <div className="text-sm">{selectedActivity.completedBy || '-'}</div>
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-base font-semibold">Completed At</Label>
                    <div className="text-sm">
                      {selectedActivity.completedAt ? (
                        format(new Date(selectedActivity.completedAt), "PPP")
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 