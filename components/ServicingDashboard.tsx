'use client'

import { useState, useEffect, useMemo } from 'react'
import { type ServicingActivity, getServicingActivities } from '@/server/actions/loan/getServicingActivities'
import { addServicingActivity } from '@/server/actions/loan/addServicingActivity'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export function ServicingDashboard() {
  const [activities, setActivities] = useState<ServicingActivity[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ServicingActivity | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [facilities, setFacilities] = useState<{
    id: string;
    facilityName: string;
    facilityType: string;
    creditAgreement: { agreementName: string }
  }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const loadActivities = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getServicingActivities(filters)
      setActivities(data.activities)
    } catch (err) {
      setError('Failed to load servicing activities')
      console.error(err)
    } finally {
      setIsLoading(false)
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "destructive" | "warning"> = {
      'PENDING': 'default',
      'IN_PROGRESS': 'warning',
      'COMPLETED': 'success',
      'OVERDUE': 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'dueDate',
      headerName: 'Due Date',
      valueFormatter: (params) => format(new Date(params.value), "PP"),
      filter: 'agDateColumnFilter',
      width: 150,
    },
    {
      field: 'facility.facilityName',
      headerName: 'Facility',
      width: 200,
    },
    {
      field: 'activityType',
      headerName: 'Type',
      width: 150,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 300,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      valueFormatter: (params) => formatCurrency(params.value),
      filter: 'agNumberColumnFilter',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: (params: any) => getStatusBadge(params.value),
      width: 150,
    },
    {
      field: 'completedBy',
      headerName: 'Completed By',
      width: 150,
    },
    {
      field: 'completedAt',
      headerName: 'Completed At',
      valueFormatter: (params) => params.value ? format(new Date(params.value), "PP") : '-',
      filter: 'agDateColumnFilter',
      width: 150,
    },
  ], [])

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
                  selected={filters.startDate}
                  onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
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
                  selected={filters.endDate}
                  onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <span className="text-lg mr-2">+</span>
              Add Activity
            </Button>
          </DialogTrigger>
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
        onRowClick={(data) => {
          setSelectedActivity(data)
          setIsDetailsOpen(true)
        }}
      />

      {selectedActivity && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Activity Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Label>Facility</Label>
                <div className="text-sm">{selectedActivity.facility.facilityName}</div>
              </div>
              <div>
                <Label>Type</Label>
                <div className="text-sm">{selectedActivity.activityType}</div>
              </div>
              <div>
                <Label>Due Date</Label>
                <div className="text-sm">{format(new Date(selectedActivity.dueDate), "PPP")}</div>
              </div>
              <div>
                <Label>Amount</Label>
                <div className="text-sm">{formatCurrency(selectedActivity.amount)}</div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="text-sm">{selectedActivity.description}</div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="text-sm">{selectedActivity.status}</div>
              </div>
              {selectedActivity.completedBy && (
                <>
                  <div>
                    <Label>Completed By</Label>
                    <div className="text-sm">{selectedActivity.completedBy}</div>
                  </div>
                  <div>
                    <Label>Completed At</Label>
                    <div className="text-sm">
                      {selectedActivity.completedAt ? format(new Date(selectedActivity.completedAt), "PPP") : '-'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 