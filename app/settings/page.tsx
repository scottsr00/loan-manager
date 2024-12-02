'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your application preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Appearance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Customize how the application looks on your device
            </p>
            <ThemeToggle />
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure how you want to receive notifications
            </p>
            <div className="text-sm text-muted-foreground">
              Coming soon...
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium">Data Preferences</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your data display preferences
            </p>
            <div className="text-sm text-muted-foreground">
              Coming soon...
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 