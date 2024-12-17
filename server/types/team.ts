import { z } from 'zod'

// Role Types
export const servicingRoleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Role name is required'),
  description: z.string().min(1, 'Role description is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required')
})

// Team Member Types
export const servicingTeamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE'])
})

// Assignment Types
export const servicingAssignmentSchema = z.object({
  id: z.string().optional(),
  teamMemberId: z.string().min(1, 'Team member is required'),
  facilityId: z.string().min(1, 'Facility is required'),
  assignmentType: z.enum(['PRIMARY_AGENT', 'BACKUP_AGENT', 'SPECIALIST']),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'TRANSFERRED']),
  notes: z.string().optional()
})

// Query Parameters
export const teamQueryParamsSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).optional(),
  roleId: z.string().optional(),
  search: z.string().optional()
})

// Inferred Types
export type ServicingRole = z.infer<typeof servicingRoleSchema>
export type ServicingTeamMember = z.infer<typeof servicingTeamMemberSchema>
export type ServicingAssignment = z.infer<typeof servicingAssignmentSchema>
export type TeamQueryParams = z.infer<typeof teamQueryParamsSchema>

// Role with Team Members
export type ServicingRoleWithMembers = ServicingRole & {
  teamMembers: ServicingTeamMember[]
}

// Team Member with Role and Assignments
export type TeamMemberWithDetails = ServicingTeamMember & {
  role: ServicingRole
  assignments: ServicingAssignment[]
} 