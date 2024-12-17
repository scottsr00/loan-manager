import { useState, useCallback } from 'react'
import { type TeamQueryParams, type ServicingTeamMember, type ServicingRole, type ServicingAssignment } from '@/server/types/team'
import { getTeamMembers, getRoles, upsertTeamMember, upsertRole, upsertAssignment, deleteTeamMember, deleteRole, deleteAssignment } from '@/server/actions/team'

export function useTeam() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<ServicingTeamMember[]>([])
  const [roles, setRoles] = useState<ServicingRole[]>([])

  const loadTeamMembers = useCallback(async (params: TeamQueryParams = {}) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTeamMembers(params)
      setTeamMembers(data)
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
      setRoles(data)
    } catch (err) {
      setError('Failed to load roles')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveTeamMember = useCallback(async (data: ServicingTeamMember) => {
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

  const saveRole = useCallback(async (data: ServicingRole) => {
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

  const saveAssignment = useCallback(async (data: ServicingAssignment) => {
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