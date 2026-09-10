import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react'
import { useEvent, usePlayers, useBlindStructures } from '@/hooks/useData'
import LiveTournamentClient from './LiveTournamentClient'

export default function EventLivePage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { data: event, isLoading: isEventLoading } = useEvent(eventId)
  const { data: players, isLoading: isPlayersLoading } = usePlayers()
  const { data: blindStructures, isLoading: isBlindsLoading } = useBlindStructures()

  const isLoading = isEventLoading || isPlayersLoading || isBlindsLoading

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event || event.status !== 'active') {
    return (
      <div className="space-y-6 text-center">
        <Button variant="outline" asChild className="mb-6 mr-auto">
          <Link to="/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events List
          </Link>
        </Button>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="font-headline text-destructive">Live Management Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This event cannot be managed live. It might not exist or is not currently active.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <LiveTournamentClient event={event} players={players ?? []} initialBlindStructures={blindStructures ?? []} />
}
