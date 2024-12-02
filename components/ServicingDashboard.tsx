'use client'

import { useState, useEffect } from 'react'
import { ServicingActivity, getServicingActivities } from '@/app/actions/getServicingActivities'
import { addServicingActivity } from '@/app/actions/addServicingActivity'
import { getAvailableLoans } from '@/app/actions/getAvailableLoans'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatCurrency } from "@/lib/utils"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

export function ServicingDashboard() {
  const [activities, setActivities] = useState<ServicingActivity[]>([])
  const [loans, setLoans] = useState<{ id: string; dealName: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    activityType: '',
    loanId: ''
  })

  // New activity form state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newActivity, setNewActivity] = useState({
    loanId: '',
    activityType: '',
    status: 'Pending',
    dueDate: new Date(),
    description: '',
    amount: '',
    rateChange: '',
    assignedTo: '',
    priority: 'Medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadActivities = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getServicingActivities(filters)
      setActivities(data)
    } catch (err) {
      setError('Failed to load servicing activities')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadLoans = async () => {
    try {
      const data = await getAvailableLoans()
      setLoans(data)
    } catch (err) {
      console.error('Error loading loans:', err)
    }
  }

  useEffect(() => {
    loadActivities()
    loadLoans()
  }, [])

  useEffect(() => {
    loadActivities()
  }, [filters])

  const handleAddActivity = async () => {
    setIsSubmitting(true)
    try {
      await addServicingActivity({
        ...newActivity,
        amount: newActivity.amount ? parseFloat(newActivity.amount) : undefined,
        rateChange: newActivity.rateChange ? parseFloat(newActivity.rateChange) : undefined
      })
      setIsDialogOpen(false)
      setNewActivity({
        loanId: '',
        activityType: '',
        status: 'Pending',
        dueDate: new Date(),
        description: '',
        amount: '',
        rateChange: '',
        assignedTo: '',
        priority: 'Medium'
      })
      loadActivities()
    } catch (err) {
      console.error('Error adding activity:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "destructive"> = {
      'Pending': 'default',
      'Completed': 'success',
      'Failed': 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "destructive" | "default" | "secondary"> = {
      'High': 'destructive',
      'Medium': 'default',
      'Low': 'secondary'
    }
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.activityType}
            onValueChange={(value) => setFilters(prev => ({ ...prev, activityType: value }))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="Payment">Payment</SelectItem>
              <SelectItem value="Rate Change">Rate Change</SelectItem>
              <SelectItem value="Amendment">Amendment</SelectItem>
              <SelectItem value="Notice">Notice</SelectItem>
            </SelectContent>
          </Select>
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
                <Label htmlFor="loan">Loan</Label>
                <Select
                  value={newActivity.loanId}
                  onValueChange={(value) => setNewActivity(prev => ({ ...prev, loanId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan" />
                  </SelectTrigger>
                  <SelectContent>
                    {loans.map((loan) => (
                      <SelectItem key={loan.id} value={loan.id}>
                        {loan.dealName}
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
                    <SelectItem value="Payment">Payment</SelectItem>
                    <SelectItem value="Rate Change">Rate Change</SelectItem>
                    <SelectItem value="Amendment">Amendment</SelectItem>
                    <SelectItem value="Notice">Notice</SelectItem>
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
                <Label htmlFor="amount">Amount (optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newActivity.amount}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rateChange">Rate Change % (optional)</Label>
                <Input
                  id="rateChange"
                  type="number"
                  step="0.01"
                  value={newActivity.rateChange}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, rateChange: e.target.value }))}
                  placeholder="Enter rate change"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assignedTo">Assigned To (optional)</Label>
                <Input
                  id="assignedTo"
                  value={newActivity.assignedTo}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Enter assignee"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newActivity.priority}
                  onValueChange={(value) => setNewActivity(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddActivity}
                disabled={isSubmitting || !newActivity.loanId || !newActivity.activityType || !newActivity.description}
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Due Date</TableHead>
              <TableHead>Loan</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Rate Change</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No servicing activities found
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{format(new Date(activity.dueDate), "PP")}</TableCell>
                  <TableCell>{activity.dealName}</TableCell>
                  <TableCell>{activity.activityType}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{activity.description}</TableCell>
                  <TableCell>{activity.amount ? formatCurrency(activity.amount) : '-'}</TableCell>
                  <TableCell>{activity.rateChange ? `${activity.rateChange}%` : '-'}</TableCell>
                  <TableCell>{activity.assignedTo || '-'}</TableCell>
                  <TableCell>{getPriorityBadge(activity.priority)}</TableCell>
                  <TableCell>{getStatusBadge(activity.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 