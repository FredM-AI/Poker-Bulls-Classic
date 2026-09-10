import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import EventForm from './EventForm'
import * as dataService from '@/lib/data-service'
import type { EventInput } from '@/lib/data-service'
import { useEvent, usePlayers, useSeasons, useBlindStructures, useInvalidateAll } from '@/hooks/useData'

export default function EventEditPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { data: event, isLoading: isEventLoading } = useEvent(eventId)
  const { data: players, isLoading: isPlayersLoading } = usePlayers()
  const { data: allSeasons, isLoading: isSeasonsLoading } = useSeasons()
  const { data: blindStructures, isLoading: isBlindsLoading } = useBlindStructures()
  const invalidateAll = useInvalidateAll()

  const isLoading = isEventLoading || isPlayersLoading || isSeasonsLoading || isBlindsLoading

  const handleSubmit = async (data: EventInput) => {
    const updated = await dataService.updateEvent(eventId!, data)
    invalidateAll()
    return updated.id
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="space-y-6 text-center">
        <Button variant="outline" asChild className="mb-6 mr-auto">
          <Link to="/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events List
          </Link>
        </Button>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-destructive">Event Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The event you are trying to edit does not exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link to={`/events/${event.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event Details
        </Link>
      </Button>
      <EventForm
        event={event}
        allPlayers={players ?? []}
        allSeasons={allSeasons ?? []}
        blindStructures={blindStructures ?? []}
        formTitle={`Edit Event: ${event.name}`}
        formDescription="Modify the details and results for this poker event."
        submitButtonText="Save Changes"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
