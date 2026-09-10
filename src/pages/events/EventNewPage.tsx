import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import EventForm from './EventForm'
import * as dataService from '@/lib/data-service'
import type { EventInput } from '@/lib/data-service'
import { usePlayers, useSeasons, useBlindStructures, useInvalidateAll } from '@/hooks/useData'

export default function EventNewPage() {
  const { data: players, isLoading: isPlayersLoading } = usePlayers()
  const { data: allSeasons, isLoading: isSeasonsLoading } = useSeasons()
  const { data: blindStructures, isLoading: isBlindsLoading } = useBlindStructures()
  const [searchParams] = useSearchParams()
  const defaultSeasonId = searchParams.get('seasonId') || undefined
  const invalidateAll = useInvalidateAll()

  const isLoading = isPlayersLoading || isSeasonsLoading || isBlindsLoading

  const handleSubmit = async (data: EventInput) => {
    const created = await dataService.createEvent(data)
    invalidateAll()
    return created.id
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link to="/events">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Link>
      </Button>
      <EventForm
        allPlayers={(players ?? []).filter((p) => p.isActive)}
        allSeasons={allSeasons ?? []}
        blindStructures={blindStructures ?? []}
        formTitle="Create New Event"
        formDescription="Fill in the details to schedule a new poker event."
        submitButtonText="Create Event"
        defaultSeasonId={defaultSeasonId}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
