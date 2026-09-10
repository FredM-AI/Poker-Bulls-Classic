import * as React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlusCircle, CalendarDays, Users, FolderOpen, Trophy, Eye, Edit, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { parseISO, isPast, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useEvents, useSeasons, usePlayers } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'
import { getPlayerDisplayName } from '@/lib/stats-service'
import type { Event, Player } from '@/lib/types'

const statusBadgeClass: Record<Event['status'], string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300',
}

const EventTable = ({ events, isAdmin, allPlayers }: { events: Event[]; isAdmin: boolean; allPlayers: Player[] }) => {
  if (events.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">No events in this category.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="py-2 px-3">Name</TableHead>
          <TableHead className="py-2 px-3">Date</TableHead>
          <TableHead className="py-2 px-3">Buy-in</TableHead>
          <TableHead className="py-2 px-3">Participants</TableHead>
          <TableHead className="py-2 px-3">Winner</TableHead>
          <TableHead className="py-2 px-3">Status</TableHead>
          <TableHead className="text-right py-2 px-3">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => {
          let winnerName = 'N/A'
          if (event.status === 'completed' && event.results.length > 0) {
            const winnerResult = event.results.find((r) => r.position === 1)
            if (winnerResult) {
              winnerName = getPlayerDisplayName(allPlayers.find((p) => p.id === winnerResult.playerId))
            }
          }
          return (
            <TableRow key={event.id}>
              <TableCell className="font-medium py-2 px-3">{event.name}</TableCell>
              <TableCell className="py-2 px-3">{format(parseISO(event.date), 'PPP')}</TableCell>
              <TableCell className="py-2 px-3">€{event.buyIn}</TableCell>
              <TableCell className="py-2 px-3">{event.participants.length}</TableCell>
              <TableCell className="py-2 px-3">
                {winnerName !== 'N/A' ? (
                  <span className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1.5 text-yellow-500" />
                    {winnerName}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{winnerName}</span>
                )}
              </TableCell>
              <TableCell className="py-2 px-3">
                <Badge className={cn('text-xs font-semibold border-transparent', statusBadgeClass[event.status])}>{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</Badge>
              </TableCell>
              <TableCell className="text-right space-x-2 py-2 px-3">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild title="View Event">
                  <Link to={`/events/${event.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="icon" className="h-8 w-8" asChild title="Edit Event">
                    <Link to={`/events/${event.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default function EventsPage() {
  const { data: events, isLoading: isEventsLoading } = useEvents()
  const { data: seasons, isLoading: isSeasonsLoading } = useSeasons()
  const { data: allPlayers, isLoading: isPlayersLoading } = usePlayers()
  const { role } = useAuth()
  const isAdmin = role === 'admin'

  const isLoading = isEventsLoading || isSeasonsLoading || isPlayersLoading

  const allEvents = React.useMemo(() => [...(events ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [events])
  const allSeasons = React.useMemo(() => [...(seasons ?? [])].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), [seasons])

  const { eventsBySeasonMap, unassignedEvents } = React.useMemo(() => {
    const map = new Map<string, Event[]>()
    const unassigned: Event[] = []
    allEvents.forEach((event) => {
      if (event.seasonId) {
        if (!map.has(event.seasonId)) map.set(event.seasonId, [])
        map.get(event.seasonId)!.push(event)
      } else {
        unassigned.push(event)
      }
    })
    return { eventsBySeasonMap: map, unassignedEvents: unassigned }
  }, [allEvents])

  const initialIndex = React.useMemo(() => {
    if (allSeasons.length === 0) return 0
    const activeSeasonIndex = allSeasons.findIndex((s) => s.isActive)
    if (activeSeasonIndex !== -1) return activeSeasonIndex
    const completedSeasons = allSeasons.filter((s) => s.endDate && isPast(parseISO(s.endDate)))
    if (completedSeasons.length > 0) {
      const lastCompleted = completedSeasons[completedSeasons.length - 1]
      return allSeasons.findIndex((s) => s.id === lastCompleted.id)
    }
    return 0
  }, [allSeasons])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold">Events</h1>
        {isAdmin && (
          <Button asChild>
            <Link to="/events/new">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Event
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : allEvents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20">
            <CalendarDays className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-xl">No events scheduled yet.</p>
            <p className="mt-2">{isAdmin ? 'Create your first event to get started.' : 'Check back later for scheduled events.'}</p>
            {isAdmin && (
              <Button asChild className="mt-6">
                <Link to="/events/new">
                  <PlusCircle className="mr-2 h-5 w-5" /> Create Event
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {allSeasons.length > 0 && (
            <Carousel opts={{ align: 'start', loop: false, startIndex: initialIndex }} className="w-full">
              <CarouselContent className="-ml-4">
                {allSeasons.map((season) => {
                  const seasonEvents = eventsBySeasonMap.get(season.id) || []
                  return (
                    <CarouselItem key={season.id} className="pl-4">
                      <Card className="border-none rounded-none shadow-none">
                        <CardHeader className="w-full text-left p-4">
                          <CardTitle className="font-headline text-xl flex items-center">
                            <Users className="mr-3 h-5 w-5 text-primary" />
                            SEASON: {season.name}
                            {season.isActive && <Badge className="ml-3 bg-green-500 text-white">Active</Badge>}
                          </CardTitle>
                          <CardDescription>
                            {format(parseISO(season.startDate), 'MM/dd/yyyy')} - {season.endDate ? format(parseISO(season.endDate), 'MM/dd/yyyy') : 'Ongoing'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {seasonEvents.length > 0 ? (
                            <EventTable events={seasonEvents} isAdmin={isAdmin} allPlayers={allPlayers ?? []} />
                          ) : (
                            <p className="text-muted-foreground text-sm py-4 text-center">No events scheduled for this season yet.</p>
                          )}
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious className="ml-[-10px] sm:ml-[-50px]" />
              <CarouselNext className="mr-[-10px] sm:mr-[-50px]" />
            </Carousel>
          )}

          {unassignedEvents.length > 0 && (
            <div className="pt-8">
              <Accordion type="single" collapsible className="w-full border rounded-lg overflow-hidden">
                <AccordionItem value="unassigned-events">
                  <Card className="border-none rounded-none shadow-none">
                    <AccordionTrigger className="p-0 hover:no-underline">
                      <CardHeader className="w-full text-left p-4">
                        <CardTitle className="font-headline text-xl flex items-center">
                          <FolderOpen className="mr-3 h-5 w-5 text-primary" />
                          Other Events
                        </CardTitle>
                        <CardDescription>Events not currently assigned to a specific season.</CardDescription>
                      </CardHeader>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                      <CardContent className="pt-0">
                        <EventTable events={unassignedEvents} isAdmin={isAdmin} allPlayers={allPlayers ?? []} />
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </>
      )}
    </div>
  )
}
