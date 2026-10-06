import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Eye } from 'lucide-react'
import { BlindStructureManagerForm } from '@/components/BlindStructureManager'
import { useBlindStructures, useSiteStats } from '@/hooks/useData'

export default function SettingsPage() {
  const { data: blindStructures, isLoading } = useBlindStructures()
  const { data: siteStats, isLoading: isSiteStatsLoading } = useSiteStats()

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="font-headline text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage application-wide settings and presets.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guest Visits</CardTitle>
          <CardDescription>Number of times someone has continued as a guest from the login page. Admin-only.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSiteStatsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border p-4 max-w-xs">
              <Eye className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold font-headline">{(siteStats?.guestVisits ?? 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Guest Visits</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blind Structure Management</CardTitle>
          <CardDescription>Create, edit, and manage blind structure templates that can be used for any event.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <BlindStructureManagerForm structures={blindStructures ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
