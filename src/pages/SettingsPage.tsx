import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { BlindStructureManagerForm } from '@/components/BlindStructureManager'
import { useBlindStructures } from '@/hooks/useData'

export default function SettingsPage() {
  const { data: blindStructures, isLoading } = useBlindStructures()

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="font-headline text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage application-wide settings and presets.</p>
      </div>

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
