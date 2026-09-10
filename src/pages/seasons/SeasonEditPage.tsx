import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react'
import SeasonForm from './SeasonForm'
import * as dataService from '@/lib/data-service'
import type { SeasonInput } from '@/lib/data-service'
import { useSeason, useEvents, useInvalidateAll } from '@/hooks/useData'

export default function SeasonEditPage() {
  const { seasonId } = useParams<{ seasonId: string }>()
  const { data: season, isLoading } = useSeason(seasonId)
  const { data: allEvents } = useEvents()
  const invalidateAll = useInvalidateAll()

  const handleSubmit = async (data: SeasonInput) => {
    await dataService.updateSeason(seasonId!, data)
    invalidateAll()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!season) {
    return (
      <div className="space-y-6 text-center">
        <Button variant="outline" asChild className="mb-6 mr-auto">
          <Link to="/seasons">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Seasons List
          </Link>
        </Button>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="font-headline text-destructive">Season Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The season you are trying to edit does not exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link to="/seasons">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Seasons List
        </Link>
      </Button>
      <SeasonForm
        season={season}
        allEvents={allEvents ?? []}
        formTitle={`Edit Season: ${season.name}`}
        formDescription="Modify the details for this season and manage associated events."
        submitButtonText="Save Changes"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
