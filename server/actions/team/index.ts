'use server'

import { db } from '@/server/db'
import { type TeamQueryParams, type ServicingTeamMember, type ServicingRole, type ServicingAssignment } from '@/server/types/team'
import { revalidatePath } from 'next/cache'

// Get team members with their roles and assignments
export async function getTeamMembers(params: TeamQueryParams = {}) {
  try {
    const where = {
      ...(params.status && { status: params.status }),
      ...(params.roleId && { roleId: params.roleId }),
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } }
        ]
      })
    }

    const teamMembers = await db.servicingTeamMember.findMany({
      where,
      include: {
        role: true,
        assignments: {
          include: {
            facility: {
              select: {
                facilityName: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return teamMembers
  } catch (error) {
    console.error('Error in getTeamMembers:', error)
    throw new Error('Failed to fetch team members')
  }
}

// Get all roles
export async function getRoles() {
  try {
    const roles = await db.servicingRole.findMany({
      include: {
        teamMembers: true
      },
      orderBy: { name: 'asc' }
    })
    return roles
  } catch (error) {
    console.error('Error in getRoles:', error)
    throw new Error('Failed to fetch roles')
  }
}

// Create or update team member
export async function upsertTeamMember(data: ServicingTeamMember) {
  try {
    const teamMember = await db.servicingTeamMember.upsert({
      where: {
        id: data.id || '',
        email: data.email
      },
      update: {
        name: data.name,
        roleId: data.roleId,
        status: data.status
      },
      create: {
        name: data.name,
        email: data.email,
        roleId: data.roleId,
        status: data.status
      }
    })

    revalidatePath('/team')
    return teamMember
  } catch (error) {
    console.error('Error in upsertTeamMember:', error)
    throw new Error('Failed to save team member')
  }
}

// Create or update role
export async function upsertRole(data: ServicingRole) {
  try {
    const role = await db.servicingRole.upsert({
      where: {
        id: data.id || '',
        name: data.name
      },
      update: {
        description: data.description,
        permissions: JSON.stringify(data.permissions)
      },
      create: {
        name: data.name,
        description: data.description,
        permissions: JSON.stringify(data.permissions)
      }
    })

    revalidatePath('/team')
    return role
  } catch (error) {
    console.error('Error in upsertRole:', error)
    throw new Error('Failed to save role')
  }
}

// Create or update assignment
export async function upsertAssignment(data: ServicingAssignment) {
  try {
    const assignment = await db.servicingAssignment.upsert({
      where: {
        id: data.id || ''
      },
      update: {
        assignmentType: data.assignmentType,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        notes: data.notes
      },
      create: {
        teamMemberId: data.teamMemberId,
        facilityId: data.facilityId,
        assignmentType: data.assignmentType,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        notes: data.notes
      }
    })

    revalidatePath('/team')
    return assignment
  } catch (error) {
    console.error('Error in upsertAssignment:', error)
    throw new Error('Failed to save assignment')
  }
}

// Delete team member
export async function deleteTeamMember(id: string) {
  try {
    await db.servicingTeamMember.delete({
      where: { id }
    })
    revalidatePath('/team')
  } catch (error) {
    console.error('Error in deleteTeamMember:', error)
    throw new Error('Failed to delete team member')
  }
}

// Delete role
export async function deleteRole(id: string) {
  try {
    await db.servicingRole.delete({
      where: { id }
    })
    revalidatePath('/team')
  } catch (error) {
    console.error('Error in deleteRole:', error)
    throw new Error('Failed to delete role')
  }
}

// Delete assignment
export async function deleteAssignment(id: string) {
  try {
    await db.servicingAssignment.delete({
      where: { id }
    })
    revalidatePath('/team')
  } catch (error) {
    console.error('Error in deleteAssignment:', error)
    throw new Error('Failed to delete assignment')
  }
} 