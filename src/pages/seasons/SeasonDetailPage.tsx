import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CalendarDays, BarChart3, TrendingUp, AlertTriangle, Edit, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useSeason, useEvents, usePlayers } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'
import { calculateSeasonStats } from '@/lib/stats-service'
import SeasonLeaderboardTable from './SeasonLeaderboardTable'
import SeasonPlayerProgressChart from './SeasonPlayerProgressChart'
import SeasonEventsList from './SeasonEventsList'

export default function SeasonDetailPage() {
  const { seasonId } = useParams<{ seasonId: string }>()
  const { data: season, isLoading: isSeasonLoading } = useSeason(seasonId)
  const { data: allEvents, isLoading: isEventsLoading } = useEvents()
  const { data: allPlayers, isLoading: isPlayersLoading } = usePlayers()
  const { role } = useAuth()

  const isLoading = isSeasonLoading || isEventsLoading || isPlayersLoading

  const seasonStats = React.useMemo(() => {
    if (!season || !allEvents || !allPlayers) return undefined
    return calculateSeasonStats(season, allEvents, allPlayers)
  }, [season, allEvents, allPlayers])

  const seasonEvents = React.useMemo(() => {
    if (!season || !allEvents) return []
    return allEvents.filter((e) => e.seasonId === season.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [season, allEvents])

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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Seasons
          </Link>
        </Button>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="font-headline text-destructive mt-4">Season Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The season you are looking for does not exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedSeasonEvents = seasonStats?.completedSeasonEvents || []

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Ongoing'
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="outline" asChild className="mb-2 md:mb-0">
            <Link to="/seasons">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Seasons
            </Link>
          </Button>
          <h1 className="font-headline text-3xl font-bold mt-2">{season.name}</h1>
          <p className="text-muted-foreground">
            {formatDate(season.startDate)} - {formatDate(season.endDate)}
          </p>
        </div>
        {role && (
          <Button asChild>
            <Link to={`/seasons/${season.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Season
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
          <TabsTrigger value="leaderboard">
            <BarChart3 className="mr-2 h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays className="mr-2 h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="mr-2 h-4 w-4" />
            Player Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Season Leaderboard</CardTitle>
              <CardDescription>Ranking based on total net profit/loss from season events.</CardDescription>
            </CardHeader>
            <CardContent>
              {seasonStats && seasonStats.leaderboard.length > 0 ? (
                <SeasonLeaderboardTable leaderboardData={seasonStats.leaderboard} seasonEvents={completedSeasonEvents} />
              ) : (
                <p className="text-muted-foreground text-center py-8">No completed events with results in this season yet to generate a leaderboard.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Events</CardTitle>
              <CardDescription>Overview of all events scheduled for this season (includes draft, active, completed).</CardDescription>
            </CardHeader>
            <CardContent>
              <SeasonEventsList events={seasonEvents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Player Progress</CardTitle>
              <CardDescription>Cumulative net profit/loss over the season's completed events.</CardDescription>
            </CardHeader>
            <CardContent>
              {seasonStats && completedSeasonEvents.length > 1 ? (
                <SeasonPlayerProgressChart playerProgressData={seasonStats.playerProgress} players={allPlayers ?? []} seasonEvents={completedSeasonEvents} />
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md border border-dashed">
                  <p className="text-muted-foreground text-center">Player progress chart is available after two or more events have been completed.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <CardFooter className="text-xs text-muted-foreground mt-4 border-t pt-4">
        Season created: {formatDate(season.createdAt)} | Last updated: {formatDate(season.updatedAt)}
      </CardFooter>
    </div>
  )
}
