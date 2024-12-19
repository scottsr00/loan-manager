'use client'

import { FacilityList } from '@/components/FacilityList'
import { PageLayout } from '@/components/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FacilitiesPage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Facility List</CardTitle>
            <CardDescription>View and manage all facilities across credit agreements</CardDescription>
          </CardHeader>
          <CardContent>
            <FacilityList />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
} 