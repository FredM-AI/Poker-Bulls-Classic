import * as React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import { BarChart3, PlusCircle, CalendarRange, Edit, Eye, CheckCircle, XCircle, Crown, Award, Trophy, Loader2 } from 'lucide-react'
import { parseISO, isPast } from 'date-fns'
import { cn } from '@/lib/utils'
import { useSeasons, useEvents, usePlayers } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'
import { calculateSeasonStats, type LeaderboardEntry } from '@/lib/stats-service'
import type { Season, Event as EventType } from '@/lib/types'

const SeasonCard = ({
  season,
  associatedEvents,
  leaderboard,
  isAdmin,
}: {
  season: Season
  associatedEvents: EventType[]
  leaderboard: LeaderboardEntry[]
  isAdmin: boolean
}) => {
  const podium = leaderboard.filter((p) => !p.isGuest).slice(0, 3)

  return (
    <Card className="group perspective-1000 flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20">
      <div className="transition-transform duration-300 ease-in-out group-hover:-translate-y-2 transform-style-3d backface-hidden flex flex-col h-full bg-card rounded-lg">
        <CardHeader className="text-left w-full">
          <CardTitle className="font-headline text-xl">{season.name}</CardTitle>
          <CardDescription className="flex items-center text-sm">
            <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
            {new Date(season.startDate).toLocaleDateString()} - {season.endDate ? new Date(season.endDate).toLocaleDateString() : 'Ongoing'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4 pt-0">
          <div className="flex items-center gap-2">
            <Badge
              variant={season.isActive ? 'default' : 'outline'}
              className={cn(season.isActive && 'bg-green-500 hover:bg-green-600 text-primary-foreground', !season.isActive && 'border-destructive text-destructive')}
            >
              {season.isActive ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              {season.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="secondary">{associatedEvents.length} Events</Badge>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <h4 className="font-medium text-sm flex items-center">
              <Trophy className="mr-2 h-4 w-4 text-primary" />
              Podium
            </h4>
            {podium.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {podium.map((entry, index) => (
                  <li key={entry.playerId} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 truncate">
                      {index === 0 && <Crown className="h-4 w-4 text-yellow-500 shrink-0" />}
                      {index === 1 && <Award className="h-4 w-4 text-gray-400 shrink-0" />}
                      {index === 2 && <Trophy className="h-4 w-4 text-orange-400 shrink-0" />}
                      <span className="truncate">{entry.playerName}</span>
                    </div>
                    <span className={cn('font-semibold', entry.totalFinalResult > 0 && 'text-green-600', entry.totalFinalResult < 0 && 'text-red-600')}>
                      €{entry.totalFinalResult.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No leaderboard data yet.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
          <Button variant="default" size="sm" asChild title="View Season Details">
            <Link to={`/seasons/${season.id}`}>
              <Eye className="mr-1 h-4 w-4" /> View Details
            </Link>
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm" asChild title="Edit Season">
              <Link to={`/seasons/${season.id}/edit`}>
                <Edit className="mr-1 h-4 w-4" /> Edit
              </Link>
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  )
}

export default function SeasonsPage() {
  const { data: seasons, isLoading: isSeasonsLoading } = useSeasons()
  const { data: allEvents, isLoading: isEventsLoading } = useEvents()
  const { data: allPlayers, isLoading: isPlayersLoading } = usePlayers()
  const { role } = useAuth()
  const isAdmin = role === 'admin'

  const isLoading = isSeasonsLoading || isEventsLoading || isPlayersLoading

  const seasonData = React.useMemo(() => {
    if (!seasons || !allEvents || !allPlayers) return []
    const sorted = [...seasons].sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
    return sorted.map((season) => {
      const stats = calculateSeasonStats(season, allEvents, allPlayers)
      const associatedEvents = allEvents.filter((event) => event.seasonId === season.id)
      return { season, leaderboard: stats.leaderboard, associatedEvents }
    })
  }, [seasons, allEvents, allPlayers])

  const initialIndex = React.useMemo(() => {
    if (seasonData.length === 0) return 0
    const activeIndex = seasonData.findIndex((s) => s.season.isActive)
    if (activeIndex !== -1) return activeIndex
    const completed = seasonData.filter((s) => s.season.endDate && isPast(parseISO(s.season.endDate)))
    if (completed.length > 0) {
      const last = completed[completed.length - 1]
      return seasonData.findIndex((s) => s.season.id === last.season.id)
    }
    return 0
  }, [seasonData])

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="font-headline text-3xl font-bold">Seasons & Leaderboards</h1>
        {isAdmin && (
          <Button asChild>
            <Link to="/seasons/new">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Season
            </Link>
          </Button>
        )}
      </div>

      <div className="flex-grow flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : seasonData.length === 0 ? (
          <Card className="w-full max-w-lg">
            <CardContent className="text-center py-20">
              <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-xl">No seasons created yet.</p>
              <p className="mt-2">Track player performance over time by organizing events into seasons.</p>
              {isAdmin && (
                <Button asChild className="mt-6">
                  <Link to="/seasons/new">
                    <PlusCircle className="mr-2 h-5 w-5" /> Create Season
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Carousel opts={{ align: 'start', loop: false, startIndex: initialIndex }} className="w-full max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
            <CarouselContent className="-ml-4">
              {seasonData.map(({ season, leaderboard, associatedEvents }) => (
                <CarouselItem key={season.id} className="md:basis-1/2 xl:basis-1/3 pl-4">
                  <div className="p-1 h-full">
                    <SeasonCard season={season} associatedEvents={associatedEvents} leaderboard={leaderboard} isAdmin={isAdmin} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-[-50px]" />
            <CarouselNext className="mr-[-50px]" />
          </Carousel>
        )}
      </div>
    </div>
  )
}
