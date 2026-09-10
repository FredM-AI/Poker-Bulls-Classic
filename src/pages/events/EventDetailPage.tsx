import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  ArrowLeft,
  Edit,
  Users,
  DollarSign,
  Trophy,
  Info,
  Tag,
  CheckCircle,
  XCircle,
  Star,
  Gift,
  BarChart3,
  HelpCircle,
  PlayCircle,
  Repeat,
  AlertTriangle,
  Loader2,
  Clock,
  Hash,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useEvent, useEvents, usePlayers, useSeasons, useBlindStructures } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'
import { getPlayerDisplayName } from '@/lib/stats-service'
import DeleteEventButton from '@/components/DeleteEventButton'
import GoLiveButton from '@/components/GoLiveButton'
import BlindStructureDisplay from '@/components/BlindStructureDisplay'
import EventCarousel from './EventCarousel'

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { data: event, isLoading: isEventLoading } = useEvent(eventId)
  const { data: allEvents, isLoading: isEventsLoading } = useEvents()
  const { data: allPlayers, isLoading: isPlayersLoading } = usePlayers()
  const { data: seasons, isLoading: isSeasonsLoading } = useSeasons()
  const { data: blindStructures, isLoading: isBlindsLoading } = useBlindStructures()
  const { role, canManage } = useAuth()
  const isAdmin = role === 'admin'

  const isLoading = isEventLoading || isEventsLoading || isPlayersLoading || isSeasonsLoading || isBlindsLoading

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="space-y-4 text-center">
        <Button variant="outline" asChild className="mb-4 mr-auto">
          <Link to="/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events List
          </Link>
        </Button>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="font-headline text-destructive">Event Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The event you are looking for does not exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const linkedSeason = event.seasonId ? seasons?.find((s) => s.id === event.seasonId) : undefined
  const linkedBlindStructure = event.blindStructureId ? blindStructures?.find((bs) => bs.id === event.blindStructureId) : undefined

  const eventsInSameSeason = linkedSeason
    ? (allEvents ?? []).filter((e) => e.seasonId === linkedSeason.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : []
  const displayDate = format(parseISO(event.date), 'EEEE, MMMM d, yyyy')
  const sortedResults = [...event.results].sort((a, b) => a.position - b.position)
  const rebuysActive = event.rebuyPrice !== undefined && event.rebuyPrice > 0
  const includeBountiesInNetCalc = event.includeBountiesInNet ?? true
  const totalRebuys = event.results.reduce((acc, result) => acc + (result.rebuys || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-none">
          <Button variant="outline" asChild>
            <Link to="/events">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
            </Link>
          </Button>
        </div>
        <div className="flex-grow">
          {linkedSeason && <EventCarousel seasonEvents={eventsInSameSeason.map((e) => ({ id: e.id, name: e.name }))} currentEventId={event.id} />}
        </div>
        <div className="flex-none w-[138px]" />
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-muted/30 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <CardTitle className="font-headline text-2xl mb-1">{event.name}</CardTitle>
              <CardDescription className="text-md text-muted-foreground">{displayDate}</CardDescription>
              {linkedSeason && (
                <Link to={`/seasons/${linkedSeason.id}`} className="text-sm text-primary hover:underline flex items-center mt-1">
                  <BarChart3 className="mr-1.5 h-4 w-4" /> Part of: {linkedSeason.name}
                </Link>
              )}
            </div>
            {canManage && (
              <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
                {event.status === 'active' && (
                  <Button asChild size="sm" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                    <Link to={`/events/${event.id}/live`}>
                      <PlayCircle className="mr-2 h-4 w-4" /> Manage Live
                    </Link>
                  </Button>
                )}
                <GoLiveButton eventId={event.id} currentStatus={event.status} />
                {isAdmin && (
                  <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                    <Link to={`/events/${event.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Event
                    </Link>
                  </Button>
                )}
                {isAdmin && <DeleteEventButton eventId={event.id} eventName={event.name} className="w-full sm:w-auto" redirectAfterDelete />}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-headline text-lg text-primary flex items-center mb-3">
            <Info className="mr-2 h-5 w-5" />
            Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm border p-4 rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Participants:
              </span>
              <span className="font-medium">{event.participants.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Buy-in (Main Pool):
              </span>
              <span className="font-medium">€{event.buyIn}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Total Main Prize Pool:
              </span>
              <span className="font-medium">€{event.prizePool.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                {rebuysActive ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                Rebuys (Prize Pool part):
              </span>
              <span className="font-medium">{rebuysActive ? `Yes (Price: €${event.rebuyPrice})` : 'No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                <Repeat className="mr-2 h-4 w-4" />
                Total Rebuys:
              </span>
              <span className="font-medium">{totalRebuys}</span>
            </div>
            {event.bounties !== undefined && event.bounties > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Star className="mr-2 h-4 w-4 text-yellow-500" />
                  Bounty Value:
                </span>
                <span className="font-medium">€{event.bounties}</span>
              </div>
            )}
            {event.mysteryKo !== undefined && event.mysteryKo > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Gift className="mr-2 h-4 w-4 text-purple-500" />
                  Mystery KO Value:
                </span>
                <span className="font-medium">€{event.mysteryKo}</span>
              </div>
            )}
            {event.startingStack && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Hash className="mr-2 h-4 w-4" />
                  Starting Stack:
                </span>
                <span className="font-medium">{event.startingStack.toLocaleString()}</span>
              </div>
            )}
            {event.maxPlayers && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Max Players:
                </span>
                <span className="font-medium">{event.maxPlayers}</span>
              </div>
            )}
            {linkedBlindStructure && event.blindStructure && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Blind Structure:
                </span>
                <BlindStructureDisplay structure={linkedBlindStructure} />
              </div>
            )}
            <div className="flex items-center justify-between md:col-start-2">
              <span className="text-muted-foreground flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                Bounties in Net Calc:
              </span>
              <span className="font-medium">{includeBountiesInNetCalc ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {event.status === 'completed' && sortedResults.length > 0 && (
            <div className="md:col-span-2 space-y-3 pt-4 mt-4 border-t">
              <h3 className="font-headline text-lg text-primary flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                Results ({event.participants.length} Participants)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left font-semibold">Pos</th>
                      <th className="p-2 text-left font-semibold">Player</th>
                      <th className="p-2 text-center font-semibold">Rebuys</th>
                      <th className="p-2 text-right font-semibold">Prize (€)</th>
                      <th className="p-2 text-right font-semibold">Bounties (€)</th>
                      <th className="p-2 text-right font-semibold">MSKO (€)</th>
                      <th className="p-2 text-right font-semibold">Net (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((result, index) => {
                      const prizeNum = result.prize || 0
                      const bountiesWonNum = result.bountiesWon || 0
                      const mysteryKoWonNum = result.mysteryKoWon || 0

                      const mainBuyInNum = event.buyIn || 0
                      const eventBountyValue = event.bounties || 0
                      const eventMysteryKoValue = event.mysteryKo || 0
                      const rebuysNum = result.rebuys || 0
                      const rebuyPriceNum = event.rebuyPrice || 0

                      const investmentInMainPot = mainBuyInNum + rebuysNum * rebuyPriceNum
                      let netResult = 0

                      if (includeBountiesInNetCalc) {
                        const bountyAndMkoCostsPerEntry = eventBountyValue + eventMysteryKoValue
                        const totalInvestmentInExtras = (1 + rebuysNum) * bountyAndMkoCostsPerEntry
                        const totalInvestment = investmentInMainPot + totalInvestmentInExtras
                        const totalWinnings = prizeNum + bountiesWonNum + mysteryKoWonNum
                        netResult = totalWinnings - totalInvestment
                      } else {
                        netResult = prizeNum - investmentInMainPot
                      }

                      return (
                        <tr key={index} className="border-b last:border-b-0 hover:bg-muted/50">
                          <td className="p-2">{result.position}</td>
                          <td className="p-2">
                            <Link to={`/players/${result.playerId}`} className="hover:underline">
                              {getPlayerDisplayName(allPlayers?.find((p) => p.id === result.playerId))}
                            </Link>
                          </td>
                          <td className="p-2 text-center">{result.rebuys ?? 0}</td>
                          <td className="p-2 text-right">€{result.prize}</td>
                          <td className="p-2 text-right">€{result.bountiesWon || 0}</td>
                          <td className="p-2 text-right">€{result.mysteryKoWon || 0}</td>
                          <td className={`p-2 text-right font-medium ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>€{netResult}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {event.status === 'completed' && sortedResults.length === 0 && event.participants.length > 0 && (
            <div className="md:col-span-2 space-y-3 pt-3 border-t mt-3">
              <h3 className="font-headline text-lg text-primary flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                Results
              </h3>
              <p className="text-sm text-muted-foreground">Results have not been entered for this completed event.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 bg-muted/30 border-t">
          <p className="text-xs text-muted-foreground">
            Created: {format(parseISO(event.createdAt), 'PP')} | Last Updated: {format(parseISO(event.updatedAt), 'PP')}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
