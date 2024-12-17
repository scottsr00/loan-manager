export interface ServicingActivity {
  id: string
  facilityId: string
  facility: {
    name: string
    facilityName: string
    commitmentAmount: number
    availableAmount: number
  }
  activityType: string
  dueDate: Date
  description?: string
  amount: number
  status: string
  completedAt?: Date
  completedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface ServicingActivityParams {
  page?: number
  pageSize?: number
  status?: string
  activityType?: string
  facilityId?: string
  startDate?: Date
  endDate?: Date
} 