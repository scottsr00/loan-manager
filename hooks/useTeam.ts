import { useState, useCallback } from 'react'
import { type TeamQueryParams } from '@/server/types/team'
import { getTeamMembers, getRoles, upsertTeamMember, upsertRole, upsertAssignment, deleteTeamMember, deleteRole, deleteAssignment } from '@/server/actions/team'

interface TeamMember {
  id?: string;
  name: string;
  email: string;
  roleId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  role?: {
    id: string;
    name: string;
  };
  assignments?: Array<{
    id: string;
    status: 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED';
    assignmentType: 'PRIMARY_AGENT' | 'BACKUP_AGENT' | 'SPECIALIST';
    startDate: Date;
    endDate?: Date;
    facility: {
      facilityName: string;
    };
  }>;
}

interface Role {
  id?: string;
  name: string;
  description: string;
  permissions: string[];
}

interface Assignment {
  id?: string;
  teamMemberId: string;
  facilityId: string;
  assignmentType: 'PRIMARY_AGENT' | 'BACKUP_AGENT' | 'SPECIALIST';
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED';
  notes: string;
}

export function useTeam() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  const loadTeamMembers = useCallback(async (params: TeamQueryParams = {}) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTeamMembers(params)
      setTeamMembers(data.map(member => ({
        ...member,
        status: member.status as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE',
        assignments: member.assignments?.map(assignment => ({
          ...assignment,
          status: assignment.status as 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED',
          assignmentType: assignment.assignmentType as 'PRIMARY_AGENT' | 'BACKUP_AGENT' | 'SPECIALIST'
        }))
      })))
    } catch (err) {
      setError('Failed to load team members')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadRoles = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRoles()
      setRoles(data.map(role => ({
        ...role,
        permissions: Array.isArray(role.permissions) ? role.permissions : [role.permissions]
      })))
    } catch (err) {
      setError('Failed to load roles')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveTeamMember = useCallback(async (data: TeamMember) => {
    setError(null)
    try {
      await upsertTeamMember(data)
      await loadTeamMembers()
    } catch (err) {
      setError('Failed to save team member')
      console.error(err)
      throw err
    }
  }, [loadTeamMembers])

  const saveRole = useCallback(async (data: Role) => {
    setError(null)
    try {
      await upsertRole(data)
      await loadRoles()
    } catch (err) {
      setError('Failed to save role')
      console.error(err)
      throw err
    }
  }, [loadRoles])

  const saveAssignment = useCallback(async (data: Assignment) => {
    setError(null)
    try {
      await upsertAssignment(data)
      await loadTeamMembers()
    } catch (err) {
      setError('Failed to save assignment')
      console.error(err)
      throw err
    }
  }, [loadTeamMembers])

  const removeTeamMember = useCallback(async (id: string) => {
    setError(null)
    try {
      await deleteTeamMember(id)
      await loadTeamMembers()
    } catch (err) {
      setError('Failed to delete team member')
      console.error(err)
      throw err
    }
  }, [loadTeamMembers])

  const removeRole = useCallback(async (id: string) => {
    setError(null)
    try {
      await deleteRole(id)
      await loadRoles()
    } catch (err) {
      setError('Failed to delete role')
      console.error(err)
      throw err
    }
  }, [loadRoles])

  const removeAssignment = useCallback(async (id: string) => {
    setError(null)
    try {
      await deleteAssignment(id)
      await loadTeamMembers()
    } catch (err) {
      setError('Failed to delete assignment')
      console.error(err)
      throw err
    }
  }, [loadTeamMembers])

  return {
    isLoading,
    error,
    teamMembers,
    roles,
    loadTeamMembers,
    loadRoles,
    saveTeamMember,
    saveRole,
    saveAssignment,
    removeTeamMember,
    removeRole,
    removeAssignment
  }
} 