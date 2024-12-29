import { PageLayout, PageHeader } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TeamManagementClient } from '@/components/team/TeamManagementClient'

export default function TeamManagementPage() {
  return (
    <PageLayout
      header={
        <PageHeader
          title="Team Management"
          description="Manage team members and their roles"
        />
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage team member roles and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamManagementClient />
        </CardContent>
      </Card>
    </PageLayout>
  )
} 