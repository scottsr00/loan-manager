'use client'

import { useState, useEffect } from 'react'
import { useTeam } from '@/hooks/useTeam'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, UserPlus, Shield } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type FilterStatus = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
type FilterRoleId = 'ALL' | string

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

interface TeamMemberForm {
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

interface RoleForm {
  id?: string;
  name: string;
  description: string;
  permissions: string[];
}

export function TeamManagementClient() {
  const {
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
  }: {
    isLoading: boolean;
    error: string | null;
    teamMembers: TeamMember[];
    roles: Role[];
    loadTeamMembers: () => Promise<void>;
    loadRoles: () => Promise<void>;
    saveTeamMember: (member: TeamMemberForm) => Promise<void>;
    saveRole: (role: RoleForm) => Promise<void>;
    saveAssignment: (assignment: Assignment) => Promise<void>;
    removeTeamMember: (id: string) => Promise<void>;
    removeRole: (id: string) => Promise<void>;
    removeAssignment: (id: string) => Promise<void>;
  } = useTeam()

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const [filters, setFilters] = useState<{
    status: FilterStatus
    roleId: FilterRoleId
    search: string
  }>({
    status: 'ALL',
    roleId: 'ALL',
    search: ''
  })

  // Form states
  const [memberForm, setMemberForm] = useState<TeamMemberForm>({
    name: '',
    email: '',
    roleId: '',
    status: 'ACTIVE',
    role: undefined,
    assignments: []
  })

  const [roleForm, setRoleForm] = useState<RoleForm>({
    name: '',
    description: '',
    permissions: []
  })

  const [assignmentForm, setAssignmentForm] = useState<Assignment>({
    teamMemberId: '',
    facilityId: '',
    assignmentType: 'PRIMARY_AGENT',
    startDate: new Date(),
    status: 'ACTIVE',
    notes: ''
  })

  useEffect(() => {
    loadTeamMembers()
    loadRoles()
  }, [loadTeamMembers, loadRoles])

  const handleSaveMember = async () => {
    try {
      await saveTeamMember(memberForm)
      setIsAddMemberOpen(false)
      setMemberForm({
        name: '',
        email: '',
        roleId: '',
        status: 'ACTIVE',
        role: undefined,
        assignments: []
      })
    } catch (err) {
      console.error('Error saving member:', err)
    }
  }

  const handleSaveRole = async () => {
    try {
      await saveRole(roleForm)
      setIsAddRoleOpen(false)
      setRoleForm({
        name: '',
        description: '',
        permissions: []
      })
    } catch (err) {
      console.error('Error saving role:', err)
    }
  }

  const handleSaveAssignment = async () => {
    try {
      await saveAssignment(assignmentForm)
      setIsAssignmentOpen(false)
      setAssignmentForm({
        teamMemberId: '',
        facilityId: '',
        assignmentType: 'PRIMARY_AGENT',
        startDate: new Date(),
        status: 'ACTIVE',
        notes: ''
      })
    } catch (err) {
      console.error('Error saving assignment:', err)
    }
  }

  const handleDelete = async () => {
    if (selectedMember && selectedMember.id) {
      await removeTeamMember(selectedMember.id)
      setIsDeleteDialogOpen(false)
      setSelectedMember(null)
    }
  }

  const where = {
    ...(filters.status && filters.status !== 'ALL' && { status: filters.status }),
    ...(filters.roleId && filters.roleId !== 'ALL' && { roleId: filters.roleId }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ]
    })
  }

  const handleStatusChange = (value: FilterStatus) => {
    setFilters(prev => ({ ...prev, status: value }))
  }

  const handleRoleChange = (value: FilterRoleId) => {
    setFilters(prev => ({ ...prev, roleId: value }))
  }

  const handleMemberStatusChange = (value: TeamMember['status']) => {
    setMemberForm(prev => ({ ...prev, status: value }))
  }

  const handleAssignmentStatusChange = (value: Assignment['status']) => {
    setAssignmentForm(prev => ({ ...prev, status: value }))
  }

  const handleAssignmentTypeChange = (value: Assignment['assignmentType']) => {
    setAssignmentForm(prev => ({ ...prev, assignmentType: value }))
  }

  const renderAssignments = (member: TeamMember) => {
    if (!member.assignments) return null
    return member.assignments.map((assignment) => (
      <div key={assignment.id} className="text-sm text-muted-foreground">
        {assignment.assignmentType} - {assignment.status}
      </div>
    ))
  }

  const renderRole = (member: TeamMember) => {
    if (!member.role) return null
    return <div className="text-sm text-muted-foreground">{member.role.name}</div>
  }

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member)
    setMemberForm({
      id: member.id,
      name: member.name,
      email: member.email,
      roleId: member.roleId,
      status: member.status,
      role: member.role,
      assignments: member.assignments
    })
    setIsAddMemberOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setRoleForm({
      ...roleForm,
      name: role.name
    })
    setIsAddRoleOpen(true)
  }

  const handleEditAssignment = (assignment: Assignment) => {
    setAssignmentForm({
      ...assignment,
      notes: assignment.notes || ''
    })
    setIsAssignmentOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Input
            placeholder="Search members..."
            className="w-[300px]"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          <Select
            value={filters.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="ON_LEAVE">On Leave</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.roleId}
            onValueChange={handleRoleChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              {roles.filter(role => role.id).map((role) => (
                <SelectItem key={role.id} value={role.id!}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
                <DialogDescription>Create a new role for team members</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input
                    value={roleForm.name}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <Select
                    value={roleForm.permissions[0]}
                    onValueChange={(value) => setRoleForm(prev => ({ ...prev, permissions: [value] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select permissions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveRole} className="w-full">
                  Save Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>Add a new member to the team</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={memberForm.name}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={memberForm.roleId}
                    onValueChange={(value) => setMemberForm(prev => ({ ...prev, roleId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(role => role.id).map((role) => (
                        <SelectItem key={role.id} value={role.id!}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={memberForm.status}
                    onValueChange={handleMemberStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveMember} className="w-full">
                  Save Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member: TeamMember) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  {member.role && (
                    <Badge variant="secondary">{member.role.name}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      member.status === 'ACTIVE'
                        ? 'default'
                        : member.status === 'INACTIVE'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {member.assignments?.map((assignment) => (
                      <Badge key={assignment.id} variant="outline">
                        {assignment.facility.facilityName}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditMember(member)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedMember(member)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team member
              and remove all of their assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 