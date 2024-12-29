'use client'

import '@/lib/ag-grid-init'
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
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState<ServicingActivityType[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<ServicingActivityType | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [formData, setFormData] = useState({
    facilityId: '',
    activityType: '',
    dueDate: new Date(),
    description: '',
    amount: 0,
  })

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'facility.creditAgreement.agreementNumber',
      headerName: 'Agreement',
      width: 150,
    },
    {
      field: 'facility.facilityName',
      headerName: 'Facility',
      width: 200,
    },
    {
      field: 'activityType',
      headerName: 'Activity Type',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'COMPLETED' ? 'success' : 'secondary'}>
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 150,
      valueFormatter: (params: any) => params.value ? format(new Date(params.value), 'MMM d, yyyy') : '-',
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
      valueFormatter: (params: any) => formatCurrency(params.value),
    },
  ], [])

  useEffect(() => {
    loadActivities()
    loadFacilities()
  }, [])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      const { activities } = await getServicingActivities()
      setActivities(activities)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFacilities = async () => {
    try {
      const data = await getFacilities()
      setFacilities(data)
    } catch (error) {
      console.error('Error loading facilities:', error)
    }
  }

  const handleAddActivity = async () => {
    try {
      await addServicingActivity({
        ...formData,
        status: 'PENDING',
      })
      setIsAddDialogOpen(false)
      setFormData({
        facilityId: '',
        activityType: '',
        dueDate: new Date(),
        description: '',
        amount: 0,
      })
      loadActivities()
    } catch (error) {
      console.error('Error adding activity:', error)
    }
  }

  const handleComplete = async (activity: ServicingActivityType) => {
    try {
      await updateServicingActivity({
        id: activity.id,
        status: 'COMPLETED',
        completedBy: 'Current User', // TODO: Get from auth
      })
      loadActivities()
    } catch (error) {
      console.error('Error completing activity:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Activity</Button>
      </div>

      <DataGrid
        rowData={activities}
        columnDefs={columnDefs}
        onRowClick={(params) => {
          setSelectedActivity(params.data)
          setIsDetailsOpen(true)
        }}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Servicing Activity</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="facility">Facility</Label>
              <Select
                value={formData.facilityId}
                onValueChange={(value) => setFormData({ ...formData, facilityId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.creditAgreement.agreementNumber} - {facility.facilityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activityType">Activity Type</Label>
              <Select
                value={formData.activityType}
                onValueChange={(value) => setFormData({ ...formData, activityType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTEREST_PAYMENT">Interest Payment</SelectItem>
                  <SelectItem value="PRINCIPAL_PAYMENT">Principal Payment</SelectItem>
                  <SelectItem value="COVENANT_REVIEW">Covenant Review</SelectItem>
                  <SelectItem value="FINANCIAL_REVIEW">Financial Review</SelectItem>
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
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData({ ...formData, dueDate: date || new Date() })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddActivity}>Add Activity</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ServicingActivityDetailsModal
        activity={selectedActivity}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onUpdate={loadActivities}
      />
    </div>
  )
} 